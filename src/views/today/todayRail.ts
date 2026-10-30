import type { CompanionContext } from "@/domain/companion";
import { recordHref } from "@/domain/followUp";
import { countText, decisionCount, type TodayWork } from "@/domain/today";
import { senderName } from "@/views/inbox/inboxCompanion";

/*
   What the Do For Me rail shows on Today ("Today context"): how many things
   need a decision, the count per kind, and the records to open first, with
   "Review all" pointing at the page's Needs decision. The same records as the
   page, never suggestions: Do For Me has no Today recommendations, and nothing
   here is AI.
*/

const LINKS_SHOWN = 5;

const GUIDANCE = "From Odoo records and fixed rules. Nothing here is AI.";

export function todayRailContext(work: TodayWork, settled: boolean): CompanionContext {
  const { count, partial } = decisionCount(work);
  let intelTitle = "Checking what needs a decision…";
  if (settled) intelTitle = count === 0 ? "Nothing needs a decision" : `${countText(count, partial)} need a decision`;

  const intel: { label: string; value: string }[] = [];
  if (work.coverage) intel.push({ label: "Classes with no instructor", value: String(work.coverage.gaps.length) });
  if (work.deliveries) {
    intel.push({ label: "Replies not delivered", value: countText(work.deliveries.problems.length, work.deliveries.partial) });
  }
  if (work.messages) intel.push({ label: "Messages waiting", value: countText(work.messages.total, work.messages.partial) });
  if (work.due) intel.push({ label: "CRM follow-ups due", value: countText(work.due.tasks.length, work.due.partial) });
  if (work.noNextAction) {
    intel.push({
      label: "Leads without a next action",
      value: countText(work.noNextAction.leads.length, work.noNextAction.partial),
    });
  }

  // The records to open first: replies that didn't go through, then CRM tasks
  const links: NonNullable<CompanionContext["links"]> = [];
  for (const { delivery, message } of work.deliveries?.problems ?? []) {
    links.push({
      id: `delivery-${delivery.id}`,
      title: `Reply to ${senderName(message)}`,
      detail: delivery.state === "failed" ? "Failed" : "Uncertain",
      href: `/inbox?message=${message.id}`,
    });
  }
  for (const task of work.due?.tasks ?? []) {
    links.push({
      id: `task-${task.id}`,
      title: task.summary,
      detail: `${task.relatedName} · ${task.state === "overdue" ? "Overdue" : "Due today"}`,
      href: recordHref(task),
    });
  }
  const shown = links.slice(0, LINKS_SHOWN);
  if (settled && count > 0) {
    shown.push({ id: "review-all", title: "Review all", detail: "Needs decision on Today", href: "/today#needs-decision" });
  }

  return {
    label: "Today context",
    intelTitle,
    intel,
    links: shown,
    guidance: GUIDANCE,
    suggestions: [],
    receipts: [],
  };
}
