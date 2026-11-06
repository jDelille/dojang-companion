"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DELIVERY_LABELS, MESSAGE_STATE_LABELS, type MessageState } from "@/domain/inbox";
import type { FollowUp } from '@/domain/followUp';
import { recordHref } from "@/domain/followUp";
import { countText, type TodayCrmRead, type TodayWork } from "@/domain/today";
import { deliveryMeaning, senderName } from "@/views/inbox/inboxCompanion";

/*
   Today's NEEDS DECISION: the real records that need staff now, each saying
   where it comes from. Odoo records (classes with no instructor, guardian
   messages, replies that didn't go through, CRM tasks) and one fixed Odoo rule
   (leads without a next action). Nothing here is AI and nothing here changes
   anything: each row opens the page where it's handled, when DreamOS has one.

   Each source shows what it could read; one that failed says so on its own
   line and the others still show.
*/

const TASKS_SHOWN = 5;

const MESSAGE_STATES: MessageState[] = ["unmatched", "received", "resolved"];

const sectionLabel =
  "block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

const plural = (count: string, one: string, many: string) => `${count} ${count === "1" ? one : many}`;

// One thing to decide: ! needs action now, ● worth handling today
function DecisionRow({
  tone,
  title,
  detail,
  href,
  onAction,
  actionLabel,
}: {
  tone: "warning" | "info";
  title: ReactNode;
  detail?: ReactNode;
  href?: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
          tone === "warning" ? "bg-(--crm-brand) text-white" : "text-(--crm-muted)"
        }`}
      >
        {tone === "warning" ? "!" : "●"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-(--crm-text)">{title}</span>
        {detail && <span className="block text-[11px] leading-relaxed text-(--crm-text-secondary)">{detail}</span>}
      </span>
      {href && <ChevronRight size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-(--crm-muted)" />}
    </>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className="flex items-start gap-3 rounded-lg py-3 hover:bg-(--crm-raised)">
          {body}
        </Link>
      ) : (
        <div className="flex items-start gap-3 py-3">{body}</div>
      )}
      {onAction && <button type="button" className="mb-3 ml-8 text-xs font-semibold underline" onClick={onAction}>{actionLabel ?? 'Review'}</button>}
    </li>
  );
}

// A source that couldn't be read (never shown as "nothing")
function SourceNote({ children }: { children: ReactNode }) {
  return <p className="py-2 text-[11px] text-(--crm-text-secondary)">{children}</p>;
}

export default function NeedsDecision({
  work,
  crm,
  contextFailure,
  onRetry,
  onCompleteTask,
  onOpenClass,
}: {
  work: TodayWork;
  crm: TodayCrmRead;
  contextFailure: string | null; // why the Hub's context read failed, if it did
  onRetry: () => void;
  onCompleteTask?: (task: FollowUp) => void;
  onOpenClass?: (id: string) => void;
}) {
  const { coverage, deliveries, messages, due, noNextAction } = work;
  const rows: ReactNode[] = [];

  // Instructor coverage (Odoo: the class's session has no instructor assigned)
  for (const { session } of coverage?.gaps ?? []) {
    const time = session.startsAt
      ? new Date(session.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "";
    rows.push(
      <DecisionRow
        key={`coverage-${session.id}`}
        tone="warning"
        title={`${time} ${session.title} has no instructor assigned in Odoo`.trim()}
        detail="Instructor assignment is managed in Odoo. Review the class roster here."
        onAction={onOpenClass ? () => onOpenClass(session.id) : undefined}
        actionLabel="Review class roster"
      />,
    );
  }

  // Replies that didn't go through (the Hub's delivery states)
  for (const { delivery, message } of deliveries?.problems ?? []) {
    rows.push(
      <DecisionRow
        key={`delivery-${delivery.id}`}
        tone="warning"
        title={`Reply to ${senderName(message)}: ${DELIVERY_LABELS[delivery.state]}`}
        detail={deliveryMeaning(delivery)}
        href={`/inbox?message=${message.id}`}
      />,
    );
  }

  // Guardian messages waiting for staff, by what staff have to do
  if (messages) {
    for (const state of MESSAGE_STATES) {
      const count = messages.counts[state];
      if (count === 0) continue;
      rows.push(
        <DecisionRow
          key={`messages-${state}`}
          tone="info"
          title={`${plural(countText(count, messages.partial), "message", "messages")} · ${MESSAGE_STATE_LABELS[state]}`}
          detail="Guardian SMS and WhatsApp, handled in the Inbox"
          href="/inbox"
        />,
      );
    }
  }

  // CRM tasks overdue or due today (owners and managers; Follow-ups' order)
  if (due && due.tasks.length > 0) {
    for (const task of due.tasks.slice(0, TASKS_SHOWN)) {
      rows.push(
        <DecisionRow
          key={`task-${task.id}`}
          tone={task.state === "overdue" ? "warning" : "info"}
          title={task.summary}
          detail={`CRM follow-up · ${task.relatedName} · ${task.state === "overdue" ? "Overdue" : "Due today"}`}
          href={recordHref(task)}
          onAction={task.canComplete && onCompleteTask ? () => onCompleteTask(task) : undefined}
          actionLabel="Record task outcome"
        />,
      );
    }
    rows.push(
      <DecisionRow
        key="tasks-all"
        tone="info"
        title={`CRM follow-ups: ${countText(due.overdue, due.partial)} overdue · ${countText(due.today, due.partial)} due today`}
        detail={due.tasks.length > TASKS_SHOWN ? `${due.tasks.length - TASKS_SHOWN} more in Follow-ups` : "All in Follow-ups"}
        href="/crm/follow-ups"
      />,
    );
  }

  // Leads without a next action: Odoo's fixed evidence rule, not a recommendation
  if (noNextAction && noNextAction.leads.length > 0) {
    rows.push(
      <DecisionRow
        key="leads-next-action"
        tone="info"
        title={`${plural(countText(noNextAction.leads.length, noNextAction.partial), "lead", "leads")} without a next action`}
        detail={`Odoo rule: no open task, and Odoo's evidence rates them High or Now${
          noNextAction.partial ? " (from the latest 100 leads only)" : ""
        }.`}
        href="/crm/follow-ups"
      />,
    );
  }

  // What couldn't be checked, source by source
  const notes: ReactNode[] = [];
  if (messages?.partial || deliveries?.partial) notes.push(<SourceNote key="message-window">The message read reached its limit. Older message work or delivery issues may be omitted.</SourceNote>);
  if (contextFailure) {
    notes.push(
      <SourceNote key="context">
        Class coverage, guardian messages and replies couldn&apos;t be checked. {contextFailure}{" "}
        <button type="button" onClick={onRetry} className="font-bold text-(--crm-text) hover:underline">
          Try again
        </button>
      </SourceNote>,
    );
  }
  if (work.rostersPending) {
    notes.push(<SourceNote key="rosters-pending">Checking class rosters for instructor coverage…</SourceNote>);
  } else if (coverage && coverage.unchecked > 0) {
    notes.push(
      <SourceNote key="rosters-unchecked">
        Instructor coverage couldn&apos;t be checked for {coverage.unchecked}{" "}
        {coverage.unchecked === 1 ? "class" : "classes"} (roster not loaded or unavailable).
      </SourceNote>,
    );
  }
  if (crm.outcome === "unavailable") {
    notes.push(<SourceNote key="crm">CRM follow-ups couldn&apos;t be checked. {crm.text}</SourceNote>);
  } else if (crm.outcome === "loaded" && crm.context.followUps.outcome === "notSent") {
    notes.push(<SourceNote key="crm-tasks">This Odoo version doesn&apos;t send CRM tasks.</SourceNote>);
  } else if (crm.outcome === "loaded" && crm.context.followUps.outcome === "unreadable") {
    notes.push(<SourceNote key="crm-tasks">Odoo sent CRM tasks DreamOS can&apos;t read.</SourceNote>);
  }

  return (
    <section
      id="needs-decision"
      aria-label="Needs decision"
      className="scroll-mt-4 rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-4"
    >
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className={sectionLabel}>Needs decision</h2>
        <span className="text-[10px] text-(--crm-muted)">From Odoo records and fixed rules</span>
      </header>
      {rows.length > 0 && <ul className="divide-y divide-(--crm-line)">{rows}</ul>}
      {rows.length === 0 && notes.length === 0 && (
        <p className="py-2 text-[12px] text-(--crm-muted)">Nothing needs a decision right now.</p>
      )}
      {notes}
    </section>
  );
}
