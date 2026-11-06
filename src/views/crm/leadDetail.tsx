"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { PrepareLeadActionResult } from "@/domain/hubAction";
import { FOLLOW_UP_CAPABILITY, followUpSuggestion } from "@/domain/leadFollowUp";
import { NEXT_ACTION_LABELS } from "@/domain/followUp";
import type { LeadDetails, LeadTask } from "@/domain/leadDetails";
import { useDoForMe } from "@/views/doForMe/doForMeProvider";
import FollowUpReview, { FollowUpPrepared } from "./followUpReview";
import { tagsOf } from "./leadViews";
import { DateLabel, TimeLabel } from "./localTime";
import TaskCompletion from "./taskCompletion";
import CrmWriteForm from "./crmWriteForm";
import LeadEditForm from './leadEditForm';
import LeadOwnerForm from './leadOwnerForm';
import TrialReservation from './trialReservation';
import TrialAttendance from './trialAttendance';
import TrialSummary from './trialSummary';
import PostTrialReview, { type PostTrialMode } from './postTrialReview';
import type { LeadAssigneesRead } from '@/domain/lead';
import type { UpdateLeadResult } from '@/domain/crmWrites';

/*
   Lead detail (CRM screen C04). Product rules from Jodi's implementation handoff
   (9 Oct 2026, page 2): name, household/contact link, stage, owner, program
   interest, source, trial session, next action and due; view timeline. Data
   shape: the Hub's lead_details. Layout follows Jodi's record layout (header,
   body, related records) and Roster's contact page (activity on the left,
   summary on the right).

   Governed internal actions: complete_task and add_lead_note in Hub mode,
   plus the existing reviewed prepare_lead_action follow-up in Hub/fixture mode.
   Contact editing uses reviewed update_lead. Draft response and booking stay off.
   Do For Me focuses this lead.
*/

const NOT_CONNECTED = "Not connected yet";
const NOT_RECORDED = "Not recorded";

const card = "rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5";
const cardLabel =
  "mb-3 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";
const actionButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) disabled:opacity-60 hover:border-(--crm-muted)";

const DUE_STYLES: Record<LeadTask["state"], string> = {
  overdue: "text-(--crm-brand)",
  today: "text-(--crm-status)",
  planned: "text-(--crm-text-secondary)",
  done: "text-(--crm-muted)",
};

// "Overdue · Oct 25", "Due today", "Due Oct 29", "Done"
function DueText({ task }: { task: LeadTask }) {
  if (task.state === "today") return <>Due today</>;
  if (task.state === "done") return <>Done</>;
  return (
    <>
      {task.state === "overdue" ? "Overdue · " : "Due "}
      <DateLabel date={task.due} />
    </>
  );
}

// "reserve_trial" -> "Reserve trial"
function actionName(action: string) {
  const words = action.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// "Ava Martinez" -> "AM"
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function Facts({ facts }: { facts: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl>
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex items-start justify-between gap-4 border-b border-(--crm-line) py-2.5 text-[12px] last:border-b-0"
        >
          <dt className="text-(--crm-text-secondary)">{fact.label}</dt>
          <dd
            className={`text-right break-all ${
              fact.value === NOT_RECORDED ? "text-(--crm-muted)" : "font-bold text-(--crm-text)"
            }`}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function LeadDetail({
  details,
  showsSampleData,
  hubMode,
  assignees,
  initialTrialBooking = false,
}: {
  details: LeadDetails;
  showsSampleData: boolean;
  // DOJANG_HUB_ENABLED=true: the lead is the real Odoo lead (lead_details). The
  // server forwards only the approved internal CRM actions, with Hub permissions.
  hubMode: boolean;
  assignees: LeadAssigneesRead;
  initialTrialBooking?: boolean;
}) {
  const { lead, tasks, trial, notes, timeline, memberId } = details;
  const doForMe = useDoForMe();
  const router = useRouter();
  const railKey = `lead:${lead.id}`;

  // A follow-up picked in the rail opens its review here
  const picked = doForMe.pickedFor(railKey);
  const reviewing = picked?.capability === FOLLOW_UP_CAPABILITY ? picked : null;
  // The last Apply's result, kept after the review closes
  const [prepared, setPrepared] = useState<PrepareLeadActionResult | null>(null);
  const [completing, setCompleting] = useState<LeadTask | null>(null);
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [bookingTrial, setBookingTrial] = useState(initialTrialBooking && hubMode && !showsSampleData);
  const [recordingTrial, setRecordingTrial] = useState<string | null>(null);
  const [trialRevision, setTrialRevision] = useState(0);
  const [postTrial, setPostTrial] = useState<{ trialId: string; mode: PostTrialMode } | null>(null);
  const [ownerSaved, setOwnerSaved] = useState(false);
  const canAssign = hubMode && !showsSampleData && assignees.outcome === 'loaded' && assignees.assignees.length > 0;
  const assignmentUnavailable = !hubMode || showsSampleData ? 'Owner assignment requires a connected Odoo record.'
    : assignees.outcome === 'unavailable' ? assignees.text : 'Odoo returned no authorized assignees.';
  const [savedEdit, setSavedEdit] = useState<UpdateLeadResult | null>(null);
  const [section, setSection] = useState<"all" | "tasks" | "timeline" | "notes">("all");
  const recommendation = followUpSuggestion(details);

  function followUpDone(result: PrepareLeadActionResult) {
    setPrepared(result);
    router.refresh(); // the new task, timeline entry and rail History come from the server
    doForMe.settle(railKey, "history");
  }
  const openTasks = tasks.filter((task) => task.state !== "done");
  const doneTasks = tasks.filter((task) => task.state === "done");
  // PROVISIONAL: "next action" is the lead's first open task (the Hub sends them soonest first)
  const nextAction = openTasks[0] ?? null;
  const laterTasks = openTasks.slice(1);

  return (
    <div className="crm-scope">
      {showsSampleData && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample lead · Development preview, not connected to Odoo
        </p>
      )}

      <article data-lead-id={lead.id}>
        {bookingTrial && <TrialReservation leadId={lead.id} onClose={() => setBookingTrial(false)} onReserved={() => { setTrialRevision(n => n + 1); router.refresh(); }} />}
        {recordingTrial !== null && <TrialAttendance key={recordingTrial} leadId={lead.id} initialTrialId={recordingTrial} onClose={() => setRecordingTrial(null)} onRecorded={() => { setTrialRevision(n => n + 1); router.refresh(); }} />}
        {postTrial && <PostTrialReview key={`${postTrial.mode}:${postTrial.trialId}`} leadId={lead.id} initialTrialId={postTrial.trialId} mode={postTrial.mode} onClose={() => setPostTrial(null)} onSaved={() => { setTrialRevision(n => n + 1); router.refresh(); }} />}
        {assigning && assignees.outcome === 'loaded' && <LeadOwnerForm lead={lead} assignees={assignees.assignees}
          onClose={() => setAssigning(false)} onReload={() => router.refresh()}
          onSaved={() => { setOwnerSaved(true); setAssigning(false); router.refresh(); }} />}
        {ownerSaved && <p role="status" className="mb-4 text-sm text-(--crm-text-secondary)">Lead owner assigned in Odoo.
          <button type="button" className="ml-3 underline" onClick={() => setOwnerSaved(false)}>Dismiss</button></p>}
        {editing && <LeadEditForm lead={lead} onClose={() => setEditing(false)} onReload={() => router.refresh()}
          onSaved={result => { setSavedEdit(result); setEditing(false); router.refresh(); }} />}
        {savedEdit && <p role="status" className="mb-4 text-sm text-(--crm-text-secondary)">Lead changes saved in Odoo{savedEdit.replayed ? ' (confirmed from the original request)' : ''}.
          <button type="button" className="ml-3 underline" onClick={() => setSavedEdit(null)}>Dismiss</button></p>}
        <Link
          href="/crm"
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-(--crm-muted) hover:text-(--crm-text)"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Sales
        </Link>

        {/* Header: identity, stage and the supported C04 actions. */}
        <header className="mb-6 flex flex-wrap items-start gap-4">
          <div
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-panel) font-(family-name:--crm-font-label) text-[11px] font-bold text-(--crm-text)"
          >
            {initials(lead.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight text-(--crm-text)">{lead.name}</h1>
            <p className="mt-1 text-sm text-(--crm-text-secondary)">{lead.contact || NOT_RECORDED}</p>
          </div>
          <span className="rounded-full border border-(--crm-status) px-3 py-1 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.12em] text-(--crm-status)">
            {lead.lostReason ? `Lost · ${lead.stage}` : lead.stage}
          </span>
          <div className="flex w-full flex-wrap gap-2">
            {lead.phone && <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} className={actionButton}>Call contact</a>}
            {lead.email && <a href={`mailto:${encodeURIComponent(lead.email)}`} className={actionButton}>Email contact</a>}
            <button type="button" onClick={() => router.refresh()} className={actionButton}>Refresh record</button>
            <button type="button" disabled={!hubMode || showsSampleData} title={!hubMode || showsSampleData ? 'Editing requires a connected Odoo record' : undefined} onClick={() => setEditing(true)} className={actionButton}>
              Edit
            </button>
            <button type="button" disabled={!canAssign} title={canAssign ? undefined : assignmentUnavailable}
              onClick={() => setAssigning(true)} className={actionButton}>Assign owner</button>
            <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
              Draft response
            </button>
            {!lead.lostReason && (
              <>
                <button type="button" disabled={!hubMode || showsSampleData} title={!hubMode || showsSampleData ? 'Trial booking requires a connected Odoo record' : undefined} onClick={() => setBookingTrial(true)} className={actionButton}>
                  Book trial
                </button>
                <button type="button" disabled={!hubMode || showsSampleData} title="Create an internal stage-review task using recorded trial attendance" onClick={() => setPostTrial({ trialId: '', mode: 'stage' })} className={actionButton}>
                  Propose stage
                </button>
              </>
            )}
            {/* Focuses the shared Do For Me rail on this lead (read-only context) */}
            <button
              type="button"
              onClick={() => doForMe.aim(`lead:${lead.id}`)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted)"
            >
              <Sparkles size={12} aria-hidden="true" />
              Do For Me
            </button>
          </div>
        </header>

        {reviewing && (
          <FollowUpReview
            key={reviewing.id}
            lead={lead}
            suggestion={reviewing}
            onDone={followUpDone}
            onCancel={() => doForMe.settle(railKey, "plan")}
            onReload={() => router.refresh()}
          />
        )}
        {!reviewing && prepared && (
          <FollowUpPrepared result={prepared} onClose={() => setPrepared(null)} />
        )}

        {lead.evidence?.detail && <details className="mb-4 rounded-xl border border-(--crm-line) bg-(--crm-panel) p-4"><summary className="cursor-pointer text-sm font-semibold">Record completeness evidence / {lead.evidence.detail.score}/100</summary><p className="mt-3 text-xs text-(--crm-muted)">{lead.evidence.detail.scoreKind} / {lead.evidence.detail.method}. Fixed Odoo evidence, not a conversion probability or an AI decision.</p><ul className="mt-3 space-y-2 text-xs">{lead.evidence.detail.reasons.map((reason,index)=><li key={index} className="flex justify-between gap-3"><span>{reason.label}{reason.recorded?'':' / Not recorded'}</span><strong>{reason.points}/{reason.available}</strong></li>)}</ul></details>}
        {lead.evidence && <section aria-label="Companion next step" className="mb-5 rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className={cardLabel}>Recorded recommendation · Fixed rule, not AI</p><h2 className="text-base font-bold text-(--crm-text)">{NEXT_ACTION_LABELS[lead.evidence.nextAction]} <span className="text-sm text-(--crm-muted)">· {lead.evidence.priority}</span></h2><p className="mt-2 text-[13px] text-(--crm-text-secondary)">{lead.evidence.priorityReason}</p></div>{recommendation && !reviewing && <button type="button" onClick={() => doForMe.aim(railKey)} className="rounded-lg bg-(--crm-brand) px-4 py-2 text-[12px] font-bold text-white">Review follow-up</button>}</div><p className="mt-3 text-[11px] text-(--crm-muted)">{lead.evidence.openTasks} open tasks · {lead.evidence.overdueTasks} overdue · {lead.evidence.dueToday} due today. Follow-up creates an internal task after review; outbound messaging is not connected here.</p></section>}

        <nav aria-label="Lead workspace sections" className="mb-4 flex flex-wrap gap-2">{([['all', 'Workspace'], ['tasks', `Tasks (${tasks.length})`], ['timeline', 'Activity'], ['notes', `Notes${notes === null ? '' : ` (${notes.length})`}`]] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={section === value} onClick={() => setSection(value)} className={`rounded-lg border px-3 py-2 text-[12px] font-semibold ${section === value ? "border-(--crm-brand) text-(--crm-text)" : "border-(--crm-line) text-(--crm-muted)"}`}>{label}</button>)}</nav>

        {completing && <TaskCompletion key={completing.id} task={tasks.find((task) => task.id === completing.id) ?? completing} subject={{ kind: "lead", id: lead.id }} enabled={hubMode && !showsSampleData} onDone={() => router.refresh()} onReload={() => router.refresh()} onClose={() => setCompleting(null)} />}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <section hidden={section !== "all" && section !== "tasks"} className={card} aria-label="Next action">
              <span className={cardLabel}>Next action</span>
              {nextAction ? (
                <>
                  <p className="text-[15px] font-bold text-(--crm-text)">{nextAction.summary}</p>
                  <p className={`mt-1 text-[12px] font-semibold ${DUE_STYLES[nextAction.state]}`}>
                    <DueText task={nextAction} /> · {nextAction.owner}
                  </p>
                  {hubMode && !showsSampleData && nextAction.canComplete === true && nextAction.version !== undefined && <button type="button" disabled={completing !== null} className={`${actionButton} mt-3`} onClick={() => setCompleting(nextAction)}>Record outcome / complete task</button>}
                </>
              ) : (
                <p className="text-[12px] text-(--crm-muted)">No open tasks on this lead.</p>
              )}

              {(laterTasks.length > 0 || doneTasks.length > 0) && (
                <ul className="mt-4 border-t border-(--crm-line)">
                  {[...laterTasks, ...doneTasks].map((task) => (
                    <li key={task.id} className="border-b border-(--crm-line) py-2.5 text-[12px] last:border-b-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span
                          className={
                            task.state === "done"
                              ? "text-(--crm-muted) line-through"
                              : "font-semibold text-(--crm-text)"
                          }
                        >
                          {task.summary}
                        </span>
                        <span className={DUE_STYLES[task.state]}>
                          <DueText task={task} /> · {task.owner}
                        </span>
                      </div>
                      {task.feedback && (
                        <p className="mt-1 text-[11px] text-(--crm-text-secondary)">Outcome: {task.feedback}</p>
                      )}
                      {hubMode && !showsSampleData && task.state !== "done" && task.canComplete === true && task.version !== undefined && <button type="button" disabled={completing !== null} className={`${actionButton} mt-2`} onClick={() => setCompleting(task)}>Record outcome / complete task</button>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section hidden={section !== "all" && section !== "timeline"} className={card} aria-label="Timeline">
              <span className={cardLabel}>Timeline</span>
              {timeline.length === 0 ? (
                <p className="text-[12px] text-(--crm-muted)">
                  No Companion actions yet. Earlier Odoo history stays in Odoo.
                </p>
              ) : (
                <ol>
                  {timeline.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-baseline justify-between gap-2 border-b border-(--crm-line) py-2.5 text-[12px] last:border-b-0"
                    >
                      <span className="font-semibold text-(--crm-text)">{actionName(entry.action)}</span>
                      <span className="text-(--crm-muted)">
                        {entry.actor} · <TimeLabel iso={entry.at} />
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section id="lead-notes" hidden={section !== "all" && section !== "notes"} className={card} aria-label="Notes">
              <span className={cardLabel}>Notes</span>
              <CrmWriteForm kind="note" title="Add internal lead note" description="Record an outcome or context for staff. This is not an outbound communication." unavailable={!hubMode || showsSampleData ? "Note saving is unavailable in fixture mode." : notes === null ? "This Hub read does not expose saved notes; review notes in Odoo." : undefined} build={(note) => ({ kind: "note", payload: { leadId: lead.id, expectedVersion: lead.version, note } })} onDone={() => router.refresh()} onReload={() => router.refresh()} />
              {notes === null ? (
                <p className="text-[12px] text-(--crm-muted)">
                  This Odoo version doesn&apos;t send lead notes. They&apos;re in Odoo.
                </p>
              ) : notes.length === 0 ? (
                <p className="text-[12px] text-(--crm-muted)">No internal notes.</p>
              ) : (
                <ul>
                  {notes.map((note) => (
                    <li key={note.id} className="border-b border-(--crm-line) py-2.5 last:border-b-0">
                      <p className="text-[13px] whitespace-pre-wrap text-(--crm-text)">{note.text}</p>
                      <p className="mt-1 text-[11px] text-(--crm-muted)">
                        {note.author} · <TimeLabel iso={note.at} />
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <section className={card} aria-label="Lead overview">
              <span className={cardLabel}>Overview</span>
              <Facts
                facts={[
                  { label: "Stage", value: lead.stage },
                  { label: "Owner", value: <span>{lead.owner}{!canAssign && <span className="mt-1 block text-[11px] font-normal text-(--crm-muted)">{assignmentUnavailable}</span>}</span> },
                  { label: "Tags", value: tagsOf(lead) },
                  { label: "Source", value: lead.source },
                  { label: "Phone", value: lead.phone || NOT_RECORDED },
                  { label: "Email", value: lead.email || NOT_RECORDED },
                  ...(lead.lostReason ? [{ label: "Lost reason", value: lead.lostReason }] : []),
                ]}
              />
            </section>

            <section className={card} aria-label="Trial session">
              <span className={cardLabel}>Trial session</span>
              {hubMode && !showsSampleData ? <TrialSummary leadId={lead.id} revision={trialRevision} onRecord={setRecordingTrial} onPostTrial={(trialId, mode) => setPostTrial({ trialId, mode })} /> : trial ? (
                <>
                  <p className="text-[13px] font-bold text-(--crm-text)">{trial.title}</p>
                  <p className="mt-1 text-[12px] text-(--crm-text-secondary)">
                    <TimeLabel iso={trial.startsAt} />
                  </p>
                </>
              ) : (
                <p className="text-[12px] text-(--crm-muted)">No trial session linked.</p>
              )}
            </section>

            <section className={card} aria-label="Related person">
              <span className={cardLabel}>Member record</span>
              {memberId ? (
                <Link
                  href={`/people/${memberId}`}
                  className="text-[12px] font-bold text-(--crm-text) underline-offset-4 hover:underline"
                >
                  Open member record →
                </Link>
              ) : (
                <p className="text-[12px] text-(--crm-muted)">Not linked to a member yet.</p>
              )}
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
