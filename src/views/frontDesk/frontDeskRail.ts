import type { CompanionContext } from "@/domain/companion";
import { compareFollowUps, recordHref } from "@/domain/followUp";
import type { CrmContext } from "@/domain/lead";

/*
   What the Do For Me rail shows on Front Desk ("Front desk context · N tasks
   due", do-for-me-1.png): the overdue and due-today CRM follow-ups from Odoo
   (crm_context tasks), each with Open. Plain records to open, not suggestions:
   Do For Me has no front-desk recommendations yet, and nothing here is AI output.
*/

// The page's crm_context read, as the server handed it over
export type CrmRead = { outcome: "loaded"; context: CrmContext } | { outcome: "unavailable"; text: string };

const LINKS_SHOWN = 8;

function railWithoutTasks(guidance: string): CompanionContext {
  return { label: "Front desk context", intelTitle: "Tasks", intel: [], guidance, suggestions: [], receipts: [] };
}

export function deskRailContext(crm: CrmRead): CompanionContext {
  if (crm.outcome === "unavailable") return railWithoutTasks(`CRM follow-ups can't be shown. ${crm.text}`);
  const read = crm.context.followUps;
  if (read.outcome === "notSent") return railWithoutTasks("This Odoo version doesn't send CRM tasks.");
  if (read.outcome === "unreadable") return railWithoutTasks("Odoo sent CRM tasks DreamOS can't read.");

  const due = read.tasks
    .filter((task) => task.state === "overdue" || task.state === "today")
    .sort((a, b) => {
      if (a.state !== b.state) return a.state === "overdue" ? -1 : 1;
      return compareFollowUps(a, b, crm.context.leads);
    });
  const count = read.moreTasks ? `At least ${due.length}` : String(due.length);

  return {
    label: "Front desk context",
    intelTitle: due.length === 0 ? "No tasks due" : `${count} ${due.length === 1 ? "task" : "tasks"} due`,
    intel: [],
    links: due.slice(0, LINKS_SHOWN).map((task) => ({
      id: task.id,
      title: task.summary,
      detail: `${task.relatedName} · ${task.state === "overdue" ? "Overdue" : "Due today"}`,
      href: recordHref(task),
    })),
    guidance:
      due.length > LINKS_SHOWN
        ? `Overdue and due-today follow-ups from Odoo. ${due.length - LINKS_SHOWN} more in Sales › Follow-ups.`
        : "Overdue and due-today follow-ups from Odoo.",
    suggestions: [],
    receipts: [],
  };
}
