"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskCompletion from "./taskCompletion";
import {
  compareFollowUps,
  FOLLOW_UP_GROUPS,
  leadOf,
  leadsWithoutNextAction,
  NEXT_ACTION_LABELS,
  type FollowUp,
  type FollowUpState,
} from "@/domain/followUp";
import type { CrmContext, Lead } from "@/domain/lead";
import { Badge } from "@/views/inbox/inboxStates";
import CrmSectionNav from "./crmSectionNav";
import FollowUpPanel, { DueText, PriorityBadge, type FollowUpSelection } from "./followUpPanel";

/*
   CRM follow-ups: a work queue answering who needs attention, what has to
   happen, when, who owns it and why. Built only from the pipeline's crm_context
   read (domain/followUp.ts):
   - the open Odoo tasks on leads and members, grouped by Odoo's own state
     (overdue / today / planned), soonest due first
   - each lead task carries its lead's recorded evidence (priority, reason,
     next action): Odoo's fixed rules, labelled as such, never AI
   - "Needs a next action": leads in this read with no open task whose evidence
     says they need one (no task recorded, or no owner)
   Selecting an item opens the context panel beside the queue (below it on
   narrow screens, under the item) without leaving the queue. Manual completion
   uses the same governed editor as the lead workspace; fixtures remain read-only.
*/

const ALL = "";

const filterSelect =
  "h-9 rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 text-[12px] text-(--crm-text) focus:border-(--crm-muted) focus:outline-none";

const groupLabel =
  "mb-2 flex items-center gap-2 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

type Related = "" | "lead" | "member";
type Selected = { kind: "task" | "lead"; id: string } | null;

// "4", or "at least 4" when Odoo sent only part of the list
function countText(count: number, partial: boolean) {
  return partial ? `at least ${count}` : String(count);
}

function SummaryTile({
  label,
  count,
  tone,
  active,
  onClick,
}: {
  label: string;
  count: string;
  tone: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-start transition-colors ${
        active ? "border-(--crm-text-secondary) bg-(--crm-interactive)" : "border-(--crm-line) bg-(--crm-raised) hover:border-(--crm-muted)"
      }`}
    >
      <span className={`block text-xl font-bold leading-tight ${tone}`}>{count}</span>
      <span className="mt-0.5 block text-[11px] text-(--crm-text-secondary)">{label}</span>
    </button>
  );
}

function TaskRow({
  task,
  lead,
  selected,
  onSelect,
}: {
  task: FollowUp;
  lead: Lead | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const evidence = lead?.evidence;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-xl border px-4 py-3 text-start transition-colors ${
        selected ? "border-(--crm-text-secondary) bg-(--crm-interactive)" : "border-(--crm-line) bg-(--crm-raised) hover:border-(--crm-muted)"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-[13px] font-bold text-(--crm-text)">{task.summary}</span>
        <span className="shrink-0">
          <DueText task={task} />
        </span>
      </span>
      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
        <Badge>{task.relatedType === "lead" ? "Lead" : "Member"}</Badge>
        <span className="font-semibold text-(--crm-text)">{task.relatedName}</span>
        <span className="text-(--crm-muted)">·</span>
        <span className={task.owner === "Unassigned" ? "text-(--crm-muted)" : "text-(--crm-text-secondary)"}>
          {task.owner}
        </span>
      </span>
      {evidence && (
        <span className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-(--crm-text-secondary)">
          <PriorityBadge priority={evidence.priority} />
          <span className="min-w-0">{evidence.priorityReason}</span>
          <span className="text-(--crm-muted)">· Next: {NEXT_ACTION_LABELS[evidence.nextAction]}</span>
        </span>
      )}
      {task.relatedType === "lead" && !lead && (
        <span className="mt-2 block text-[11px] text-(--crm-muted)">Lead evidence not in this read.</span>
      )}
    </button>
  );
}

function LeadRow({ lead, selected, onSelect }: { lead: Lead; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-xl border px-4 py-3 text-start transition-colors ${
        selected ? "border-(--crm-text-secondary) bg-(--crm-interactive)" : "border-(--crm-line) bg-(--crm-raised) hover:border-(--crm-muted)"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-[13px] font-bold text-(--crm-text)">{lead.name}</span>
        <span className="shrink-0 text-[11px] text-(--crm-muted)">No open task</span>
      </span>
      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
        <Badge>Lead</Badge>
        <span className="text-(--crm-text-secondary)">{lead.stage}</span>
        <span className="text-(--crm-muted)">·</span>
        <span className={lead.ownerId === null ? "text-(--crm-muted)" : "text-(--crm-text-secondary)"}>{lead.owner}</span>
      </span>
      {lead.evidence && (
        <span className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-(--crm-text-secondary)">
          <PriorityBadge priority={lead.evidence.priority} />
          <span className="min-w-0">{lead.evidence.priorityReason}</span>
          <span className="text-(--crm-muted)">· Next: {NEXT_ACTION_LABELS[lead.evidence.nextAction]}</span>
        </span>
      )}
    </button>
  );
}

export default function FollowUpQueue({
  context,
  showsSampleData,
  fromOdoo,
}: {
  context: CrmContext;
  showsSampleData: boolean;
  fromOdoo: boolean;
}) {
  const [ownerFilter, setOwnerFilter] = useState(ALL);
  const [relatedFilter, setRelatedFilter] = useState<Related>(ALL);
  const [stateFilter, setStateFilter] = useState<FollowUpState | null>(null);
  const [selected, setSelected] = useState<Selected>(null);
  const [completing, setCompleting] = useState<FollowUp | null>(null);
  const router = useRouter();

  const read = context.followUps;
  const tasks = read.outcome === "loaded" ? read.tasks : [];
  const partial = read.outcome === "loaded" && read.moreTasks;
  const needsNextAction = leadsWithoutNextAction(context.leads);

  // Owner choices: the CRM assignees, then anyone else owning a task or lead here
  const owners = [
    ...new Set([
      ...(context.assignees ?? []).map((assignee) => assignee.name),
      ...tasks.map((task) => task.owner),
      ...needsNextAction.map((lead) => lead.owner),
    ]),
  ].sort((a, b) => a.localeCompare(b));

  function taskMatches(task: FollowUp) {
    if (ownerFilter !== ALL && task.owner !== ownerFilter) return false;
    if (relatedFilter !== ALL && task.relatedType !== relatedFilter) return false;
    return true;
  }
  function leadMatches(lead: Lead) {
    if (ownerFilter !== ALL && lead.owner !== ownerFilter) return false;
    if (relatedFilter === "member") return false;
    return true;
  }

  const shownTasks = tasks.filter(taskMatches);
  const shownLeads = stateFilter === null ? needsNextAction.filter(leadMatches) : [];
  const countOf = (state: FollowUpState) => tasks.filter((task) => task.state === state).length;
  const groups = FOLLOW_UP_GROUPS.filter((group) => stateFilter === null || group.state === stateFilter)
    .map((group) => ({
      ...group,
      tasks: shownTasks
        .filter((task) => task.state === group.state)
        .sort((a, b) => compareFollowUps(a, b, context.leads)),
    }))
    // "Done" only appears if Odoo sends a done task
    .filter((group) => group.state !== "done" || group.tasks.length > 0);

  // What the panel shows (only while it's still in the data)
  let selection: FollowUpSelection | null = null;
  if (selected?.kind === "task") {
    const task = tasks.find((each) => each.id === selected.id);
    if (task) selection = { kind: "task", task, lead: leadOf(task, context.leads) };
  } else if (selected?.kind === "lead") {
    const lead = context.leads.find((each) => each.id === selected.id);
    if (lead) selection = { kind: "lead", lead };
  }

  const toggleState = (state: FollowUpState) => setStateFilter((current) => (current === state ? null : state));
  const isSelected = (kind: "task" | "lead", id: string) => selected?.kind === kind && selected.id === id;
  const select = (kind: "task" | "lead", id: string) =>
    setSelected(isSelected(kind, id) ? null : { kind, id });

  // Under the selected item on narrow screens; beside the queue from xl up
  const inlinePanel = (
    <div className="mt-2 rounded-xl border border-(--crm-line) bg-(--crm-panel) xl:hidden">
      <FollowUpPanel selection={selection} onClose={() => setSelected(null)} allowWrites={fromOdoo && !showsSampleData && !completing} onCompleteTask={setCompleting} />
    </div>
  );

  return (
    <div className="crm-scope">
      {showsSampleData && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample follow-ups · Development preview, not connected to Odoo
        </p>
      )}

      {completing && <div className="mb-5"><TaskCompletion key={completing.id} task={tasks.find((task) => task.id === completing.id && task.relatedType === completing.relatedType && task.relatedId === completing.relatedId) ?? completing} subject={{ kind: completing.relatedType, id: completing.relatedId }} enabled={fromOdoo && !showsSampleData} onDone={() => router.refresh()} onReload={() => router.refresh()} onClose={() => setCompleting(null)} /></div>}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Follow-up queue" className="min-w-0">
          <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight text-(--crm-text)">Follow-ups</h1>
              <p className="mt-1 text-sm text-(--crm-text-secondary)">
                Open CRM tasks on leads and members in Odoo, and leads that need a next action.
              </p>
            </div>
            <CrmSectionNav />
          </header>

          {read.outcome === "notSent" && (
            <p role="status" className="mb-5 rounded-xl border border-(--crm-line) px-4 py-3 text-[12px] text-(--crm-text-secondary)">
              This Odoo version doesn&apos;t send CRM tasks, so only leads that need a next action are listed.
            </p>
          )}
          {read.outcome === "unreadable" && (
            <p role="alert" className="mb-5 rounded-xl border border-(--crm-danger)/50 px-4 py-3 text-[12px] text-(--crm-text)">
              Odoo sent CRM tasks DreamOS can&apos;t read, so they aren&apos;t shown. Leads that need a next action
              are still listed.
            </p>
          )}

          {/* Decision-first: how much needs attention, by Odoo's own state */}
          {read.outcome === "loaded" && (
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryTile
                label="Overdue"
                count={countText(countOf("overdue"), partial)}
                tone="text-(--crm-brand)"
                active={stateFilter === "overdue"}
                onClick={() => toggleState("overdue")}
              />
              <SummaryTile
                label="Due today"
                count={countText(countOf("today"), partial)}
                tone="text-(--crm-warning)"
                active={stateFilter === "today"}
                onClick={() => toggleState("today")}
              />
              <SummaryTile
                label="Upcoming"
                count={countText(countOf("planned"), partial)}
                tone="text-(--crm-text)"
                active={stateFilter === "planned"}
                onClick={() => toggleState("planned")}
              />
              <div className="rounded-xl border border-(--crm-line) px-4 py-3">
                <span className="block text-xl font-bold leading-tight text-(--crm-text)">{needsNextAction.length}</span>
                <span className="mt-0.5 block text-[11px] text-(--crm-text-secondary)">Leads needing a next action</span>
              </div>
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-[12px] text-(--crm-text-secondary)">
              Owner
              <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} className={filterSelect}>
                <option value={ALL}>All owners</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-[12px] text-(--crm-text-secondary)">
              For
              <select
                value={relatedFilter}
                onChange={(event) => setRelatedFilter(event.target.value as Related)}
                className={filterSelect}
              >
                <option value={ALL}>Leads and members</option>
                <option value="lead">Leads</option>
                <option value="member">Members</option>
              </select>
            </label>
            {stateFilter !== null && (
              <button
                type="button"
                onClick={() => setStateFilter(null)}
                className="text-[12px] font-bold text-(--crm-text-secondary) hover:text-(--crm-text)"
              >
                Show all states
              </button>
            )}
          </div>

          {read.outcome === "loaded" && tasks.length === 0 && needsNextAction.length === 0 ? (
            <p className="rounded-xl border border-dashed border-(--crm-line) px-5 py-8 text-center text-sm text-(--crm-text-secondary)">
              No open follow-ups in Odoo, and no lead in this read needs a next action.
            </p>
          ) : (
            <div className="space-y-6">
              {read.outcome === "loaded" &&
                groups.map((group) => (
                  <section key={group.state} aria-label={group.title}>
                    <h2 className={groupLabel}>
                      {group.title}
                      <span className="font-normal normal-case tracking-normal">{group.tasks.length}</span>
                    </h2>
                    {group.tasks.length === 0 ? (
                      <p className="text-[12px] text-(--crm-muted)">
                        {shownTasks.length === tasks.length ? group.empty : "None match these filters."}
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {group.tasks.map((task) => (
                          <li key={task.id}>
                            <TaskRow
                              task={task}
                              lead={leadOf(task, context.leads)}
                              selected={isSelected("task", task.id)}
                              onSelect={() => select("task", task.id)}
                            />
                            {isSelected("task", task.id) && inlinePanel}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}

              {stateFilter === null && (
                <section aria-label="Leads needing a next action">
                  <h2 className={groupLabel}>
                    Needs a next action
                    <span className="font-normal normal-case tracking-normal">{shownLeads.length}</span>
                  </h2>
                  {shownLeads.length === 0 ? (
                    <p className="text-[12px] text-(--crm-muted)">
                      {needsNextAction.length === 0
                        ? "Every lead in this read has an open task or doesn't need one."
                        : "None match these filters."}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {shownLeads.map((lead) => (
                        <li key={lead.id}>
                          <LeadRow
                            lead={lead}
                            selected={isSelected("lead", lead.id)}
                            onSelect={() => select("lead", lead.id)}
                          />
                          {isSelected("lead", lead.id) && inlinePanel}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-[11px] text-(--crm-muted)">
                    From the leads in this read{context.moreLeads ? " (the latest 100 only)" : ""}: no open task, and
                    Odoo&apos;s evidence rates them High or Now.
                  </p>
                </section>
              )}
            </div>
          )}

          {partial && (
            <p className="mt-6 text-[11px] text-(--crm-muted)">
              Odoo sent its limit of 100 open tasks. There are more, and some may not be listed here.
            </p>
          )}
        </section>

        <aside
          aria-label="Selected follow-up"
          className="hidden self-start rounded-xl border border-(--crm-line) bg-(--crm-panel) xl:block"
        >
          <div className="sticky top-0">
            <FollowUpPanel selection={selection} onClose={() => setSelected(null)} allowWrites={fromOdoo && !showsSampleData && !completing} onCompleteTask={setCompleting} />
          </div>
        </aside>
      </div>
    </div>
  );
}
