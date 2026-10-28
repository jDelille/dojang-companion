"use client";

import Link from "next/link";
import { NEXT_ACTION_LABELS, recordHref, type FollowUp } from "@/domain/followUp";
import type { Lead, LeadEvidence } from "@/domain/lead";
import { Badge, type BadgeTone } from "@/views/inbox/inboxStates";
import { tagsOf } from "./leadViews";
import { DateLabel } from "./localTime";

/*
   The follow-up queue's context panel (like the pipeline's lead tray): the
   selected task, the lead or member it belongs to, the lead's recorded
   evidence, and where to handle it. Read-only: the actions the Hub has for this
   (complete_task, prepare_lead_action, add_lead_note, create_task) are listed
   disabled as "Not connected yet", so turning one on later is wiring, not layout.
*/

const NOT_CONNECTED = "Not connected yet";
const NOT_RECORDED = "Not recorded";

const sectionLabel =
  "mb-2 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

const PRIORITY_TONES: Record<LeadEvidence["priority"], BadgeTone> = {
  Now: "danger",
  High: "warning",
  Normal: "neutral",
  Low: "neutral",
};

// The lead's recorded priority ("Now", "High"…), from Odoo's evidence rules
export function PriorityBadge({ priority }: { priority: LeadEvidence["priority"] }) {
  return <Badge tone={PRIORITY_TONES[priority]}>{priority}</Badge>;
}

const DUE_STYLES: Record<FollowUp["state"], string> = {
  overdue: "text-(--crm-brand)",
  today: "text-(--crm-warning)",
  planned: "text-(--crm-text-secondary)",
  done: "text-(--crm-muted)",
};

// "Overdue · Oct 25", "Due today", "Due Oct 29", "No due date", from Odoo's state
export function DueText({ task }: { task: FollowUp }) {
  let text: React.ReactNode;
  if (task.state === "today") text = "Due today";
  else if (task.state === "done") text = "Done";
  else if (!task.due) text = task.state === "overdue" ? "Overdue · no due date sent" : "No due date";
  else {
    text = (
      <>
        {task.state === "overdue" ? "Overdue · " : "Due "}
        <DateLabel date={task.due} />
      </>
    );
  }
  return <span className={`text-[11px] font-bold ${DUE_STYLES[task.state]}`}>{text}</span>;
}

function Facts({ facts }: { facts: { label: string; value: React.ReactNode; muted?: boolean }[] }) {
  return (
    <dl>
      {facts.map((fact) => (
        <div key={fact.label} className="flex justify-between gap-4 border-b border-(--crm-line) py-2 text-[12px]">
          <dt className="text-(--crm-text-secondary)">{fact.label}</dt>
          <dd className={`text-right ${fact.muted ? "text-(--crm-muted)" : "font-bold text-(--crm-text)"}`}>
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DisabledAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title={NOT_CONNECTED}
      className="flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 py-2 text-start text-[12px] font-bold text-(--crm-text-secondary) opacity-60"
    >
      {label}
      <span className="text-[10px] font-normal text-(--crm-muted)">{NOT_CONNECTED}</span>
    </button>
  );
}

// The lead's evidence: Odoo's fixed rules over what's recorded, not a prediction
function EvidenceBlock({ evidence }: { evidence: LeadEvidence }) {
  return (
    <section aria-label="Recorded evidence">
      <span className={sectionLabel}>Why it&apos;s surfaced</span>
      <div className="flex items-start gap-2">
        <PriorityBadge priority={evidence.priority} />
        <p className="text-[12px] text-(--crm-text)">{evidence.priorityReason}</p>
      </div>
      <Facts
        facts={[
          { label: "Next action", value: NEXT_ACTION_LABELS[evidence.nextAction] },
          { label: "Journey", value: evidence.journey },
          { label: "Open tasks", value: String(evidence.openTasks) },
          { label: "Overdue", value: String(evidence.overdueTasks) },
          { label: "Due today", value: String(evidence.dueToday) },
          { label: "Trial linked", value: evidence.trialLinked ? "Yes" : "No" },
          { label: "Member linked", value: evidence.memberLinked ? "Yes" : "No" },
        ]}
      />
      <p className="mt-2 text-[10px] text-(--crm-muted)">
        Recorded evidence from Odoo&apos;s fixed CRM rules. Not an AI recommendation or a conversion prediction.
      </p>
    </section>
  );
}

function LeadFacts({ lead }: { lead: Lead }) {
  return (
    <Facts
      facts={[
        { label: "Contact", value: lead.contact || NOT_RECORDED, muted: !lead.contact },
        { label: "Phone", value: lead.phone || NOT_RECORDED, muted: !lead.phone },
        { label: "Email", value: lead.email || NOT_RECORDED, muted: !lead.email },
        { label: "Stage", value: lead.stage },
        { label: "Owner", value: lead.owner, muted: lead.ownerId === null },
        { label: "Source", value: lead.source },
        { label: "Tags", value: tagsOf(lead) },
      ]}
    />
  );
}

function OpenLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-(--crm-brand) px-3 text-[12px] font-bold text-white"
    >
      {label}
    </Link>
  );
}

// What's selected in the queue: a task, or a lead that has no open task
export type FollowUpSelection = { kind: "task"; task: FollowUp; lead: Lead | null } | { kind: "lead"; lead: Lead };

export default function FollowUpPanel({
  selection,
  onClose,
}: {
  selection: FollowUpSelection | null;
  onClose: () => void;
}) {
  if (!selection) {
    return (
      <p className="p-5 text-[12px] text-(--crm-muted)">
        Select a follow-up to see who it&apos;s for, why it&apos;s here and where to handle it.
      </p>
    );
  }

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      className="text-[11px] font-bold text-(--crm-text-secondary) hover:text-(--crm-text)"
    >
      Close
    </button>
  );

  // A lead with no open task: surfaced by its evidence alone
  if (selection.kind === "lead") {
    const { lead } = selection;
    return (
      <div className="space-y-5 p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-(--crm-text-secondary)">Lead · no open task</p>
            <h2 className="text-[15px] font-bold leading-snug text-(--crm-text)">{lead.name}</h2>
          </div>
          {closeButton}
        </header>
        {lead.evidence && <EvidenceBlock evidence={lead.evidence} />}
        <section aria-label="Lead">
          <span className={sectionLabel}>Lead</span>
          <LeadFacts lead={lead} />
        </section>
        <section aria-label="Actions" className="space-y-2">
          <span className={sectionLabel}>Actions</span>
          <OpenLink href={`/crm/leads/${lead.id}`} label="Open lead" />
          {lead.evidence && <DisabledAction label={`Prepare: ${NEXT_ACTION_LABELS[lead.evidence.nextAction]}`} />}
          <DisabledAction label="Create task" />
        </section>
      </div>
    );
  }

  const { task, lead } = selection;
  return (
    <div className="space-y-5 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <DueText task={task} />
          <h2 className="mt-1 text-[15px] font-bold leading-snug text-(--crm-text)">{task.summary}</h2>
        </div>
        {closeButton}
      </header>

      <Facts
        facts={[
          { label: task.relatedType === "lead" ? "Lead" : "Member", value: task.relatedName },
          { label: "Owner", value: task.owner, muted: task.owner === "Unassigned" },
          { label: "Due", value: task.due ? <DateLabel date={task.due} /> : "No due date sent", muted: !task.due },
        ]}
      />

      {task.relatedType === "lead" ? (
        lead ? (
          <>
            {lead.evidence ? (
              <EvidenceBlock evidence={lead.evidence} />
            ) : (
              <p className="text-[12px] text-(--crm-muted)">This Odoo version sends no lead evidence.</p>
            )}
            <section aria-label="Lead">
              <span className={sectionLabel}>Lead</span>
              <LeadFacts lead={lead} />
            </section>
          </>
        ) : (
          <p className="text-[12px] text-(--crm-text-secondary)">
            This lead isn&apos;t among the latest 100 leads in this read, so its stage and evidence aren&apos;t shown
            here. Open the lead to see it.
          </p>
        )
      ) : (
        <p className="text-[12px] text-(--crm-text-secondary)">
          A task on a member record. Odoo sends no CRM evidence for members; open their Member 360 for context.
        </p>
      )}

      <section aria-label="Actions" className="space-y-2">
        <span className={sectionLabel}>Actions</span>
        <OpenLink href={recordHref(task)} label={task.relatedType === "lead" ? "Open lead" : "Open member record"} />
        {task.canComplete ? (
          <DisabledAction label="Mark done" />
        ) : (
          <p className="text-[11px] text-(--crm-muted)">
            Odoo doesn&apos;t allow completing this task by hand (it belongs to an automation).
          </p>
        )}
        {task.relatedType === "lead" && lead?.evidence && (
          <DisabledAction label={`Prepare: ${NEXT_ACTION_LABELS[lead.evidence.nextAction]}`} />
        )}
        {task.relatedType === "lead" && <DisabledAction label="Add note" />}
        <p className="text-[10px] text-(--crm-muted)">Read-only for now: nothing here changes Odoo.</p>
      </section>
    </div>
  );
}
