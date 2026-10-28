import type { Lead, LeadEvidence } from "./lead";

/*
   CRM follow-ups: the open Odoo activities (mail.activity) on leads and members
   that the Hub's crm_context read sends as `tasks` (Jodi's dojo_companion_hub
   models/crm.py _task_row, 16 Oct 2026):

     { id, relatedType, relatedId, relatedName, summary, due, owner, state,
       version, canComplete, feedback }

   crm_context only sends open (active) tasks, at most 100 (moreTasks says when
   there were more). The state is Odoo's own (overdue / today / planned, worked
   out by Odoo), never recomputed here. Priority, its reason and the next action
   are the lead's recorded evidence (crm.py _lead_evidence, fixed rules, not AI);
   member tasks have none.
*/

export type FollowUpState = "overdue" | "today" | "planned" | "done";

export type FollowUp = {
  id: string;
  relatedType: "lead" | "member"; // what Odoo attached the task to
  relatedId: string;
  relatedName: string;
  summary: string; // "Confirm trial with guardian"
  due: string | null; // "2026-10-29" (a date, no time); null when Odoo sent none
  owner: string; // "Unassigned" when no one is assigned (the Hub's word)
  state: FollowUpState;
  version: number; // for complete_task's expectedVersion, once that's enabled
  canComplete: boolean; // Odoo allows completing it by hand (not an automation step)
};

// What crm_context said about follow-ups
export type FollowUpsRead =
  | { outcome: "loaded"; tasks: FollowUp[]; moreTasks: boolean }
  | { outcome: "notSent" } // this Hub version sends no tasks
  | { outcome: "unreadable" }; // sent, but not in the shape DreamOS knows

// The queue's groups, in order. "done" only shows if Odoo ever sends one.
export const FOLLOW_UP_GROUPS: { state: FollowUpState; title: string; empty: string }[] = [
  { state: "overdue", title: "Overdue", empty: "Nothing overdue." },
  { state: "today", title: "Due today", empty: "Nothing due today." },
  { state: "planned", title: "Upcoming", empty: "Nothing planned." },
  { state: "done", title: "Done", empty: "" },
];

// The lead evidence's next action, as staff read it. These are the kinds the
// Hub's prepare_lead_action takes, so each can become "Prepare …" later.
export const NEXT_ACTION_LABELS: Record<LeadEvidence["nextAction"], string> = {
  follow_up: "Follow up",
  trial: "Offer a trial",
  reactivation: "Reactivate",
  conversion: "Convert to member",
};

const PRIORITY_ORDER: Record<LeadEvidence["priority"], number> = { Now: 0, High: 1, Normal: 2, Low: 3 };

// The lead a lead task belongs to, when it's among the leads this read sent
// (crm_context sends the latest 100 leads but tasks for every lead)
export function leadOf(task: FollowUp, leads: Lead[]): Lead | null {
  if (task.relatedType !== "lead") return null;
  return leads.find((lead) => lead.id === task.relatedId) ?? null;
}

// Within a group: soonest due first (no due date last), then the lead's
// recorded priority, then Odoo's id
export function compareFollowUps(a: FollowUp, b: FollowUp, leads: Lead[]) {
  if (a.due !== b.due) {
    if (a.due === null) return 1;
    if (b.due === null) return -1;
    return a.due < b.due ? -1 : 1;
  }
  const aPriority = leadOf(a, leads)?.evidence?.priority;
  const bPriority = leadOf(b, leads)?.evidence?.priority;
  const aRank = aPriority ? PRIORITY_ORDER[aPriority] : 4;
  const bRank = bPriority ? PRIORITY_ORDER[bPriority] : 4;
  if (aRank !== bRank) return aRank - bRank;
  return Number(a.id) - Number(b.id) || (a.id < b.id ? -1 : 1);
}

// Leads with no open task whose evidence asks for one (High or Now). Won, Lost
// and Nurture leads don't, by the evidence's own rules (crm.py _lead_evidence).
export function leadsWithoutNextAction(leads: Lead[]) {
  return leads.filter(
    (lead) =>
      !lead.lostReason &&
      lead.evidence &&
      lead.evidence.openTasks === 0 &&
      (lead.evidence.priority === "Now" || lead.evidence.priority === "High"),
  );
}

// Where to handle it: the lead's record or the member's Member 360
export function recordHref(task: FollowUp) {
  return task.relatedType === "lead" ? `/crm/leads/${task.relatedId}` : `/people/${task.relatedId}`;
}
