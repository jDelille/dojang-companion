"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { PrepareLeadActionResult } from "@/domain/hubAction";
import type { LeadDetails, LeadTask } from "@/domain/leadDetails";
import { useDoForMe } from "@/views/doForMe/doForMeProvider";
import FollowUpReview, { FollowUpPrepared } from "./followUpReview";
import { programOf } from "./leadViews";
import { DateLabel, TimeLabel } from "./localTime";

/*
   Lead detail (CRM screen C04). Product rules from Jodi's implementation handoff
   (9 Oct 2026, page 2): name, household/contact link, stage, owner, program
   interest, source, trial session, next action and due; view timeline. Data
   shape: the Hub's lead_details. Layout follows Jodi's record layout (header,
   body, related records) and Roster's contact page (activity on the left,
   summary on the right).

   The one write: a Do For Me lead follow-up (followUpReview.tsx), reviewed and
   applied here, which creates an internal task through the Hub's
   prepare_lead_action. Edit, draft response, booking, notes and the rest stay off.
   "Do For Me" in the header focuses the shared rail on this lead.
*/

// The suggestion the page reviews itself (see companion-fixture.ts followUpSuggestion)
const FOLLOW_UP_CAPABILITY = "crm.lead.prepare_follow_up";

const NOT_CONNECTED = "Not connected yet";
const NOT_RECORDED = "Not recorded";

const card = "rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5";
const cardLabel =
  "mb-3 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";
const actionButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) opacity-60";

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
  peopleFromOdoo,
}: {
  details: LeadDetails;
  showsSampleData: boolean;
  // People reads real Odoo members (Hub mode) while this lead is sample data:
  // its member id would open an unrelated real record, so no link
  peopleFromOdoo: boolean;
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
    <div className="crm-scope overflow-hidden rounded-2xl border border-(--crm-line)">
      {showsSampleData && (
        <p className="border-b border-(--crm-line) px-5 py-3 text-[11px] text-(--crm-text-secondary) sm:px-6">
          Sample lead · Development preview, not connected to Odoo
        </p>
      )}

      <article className="p-5 sm:p-6" data-lead-id={lead.id}>
        <Link
          href="/crm"
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-(--crm-muted) hover:text-(--crm-text)"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Sales
        </Link>

        {/* Header: identity, stage, the actions C04 names (none connected yet) */}
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
            <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
              Edit
            </button>
            <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
              Draft response
            </button>
            {!lead.lostReason && (
              <>
                <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
                  Book trial
                </button>
                <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <section className={card} aria-label="Next action">
              <span className={cardLabel}>Next action</span>
              {nextAction ? (
                <>
                  <p className="text-[15px] font-bold text-(--crm-text)">{nextAction.summary}</p>
                  <p className={`mt-1 text-[12px] font-semibold ${DUE_STYLES[nextAction.state]}`}>
                    <DueText task={nextAction} /> · {nextAction.owner}
                  </p>
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
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={card} aria-label="Timeline">
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

            <section className={card} aria-label="Notes">
              <span className={cardLabel}>Notes</span>
              {notes.length === 0 ? (
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
                  { label: "Owner", value: lead.owner },
                  { label: "Program interest", value: programOf(lead) },
                  { label: "Source", value: lead.source },
                  { label: "Phone", value: lead.phone || NOT_RECORDED },
                  { label: "Email", value: lead.email || NOT_RECORDED },
                  ...(lead.lostReason ? [{ label: "Lost reason", value: lead.lostReason }] : []),
                ]}
              />
            </section>

            <section className={card} aria-label="Trial session">
              <span className={cardLabel}>Trial session</span>
              {trial ? (
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
              {memberId && peopleFromOdoo ? (
                <p className="text-[12px] text-(--crm-muted)">
                  Sample lead: its member link isn&apos;t shown while People reads from Odoo.
                </p>
              ) : memberId ? (
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
