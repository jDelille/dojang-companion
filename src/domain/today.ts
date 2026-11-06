import { ARRIVED_STATES, EXPECTED_STATES, type SessionRoster } from "./arrivals";
import { compareFollowUps, leadsWithoutNextAction, type FollowUp } from "./followUp";
import type { HubContext, HubDelivery, HubMessage, MessageState } from "./inbox";
import type { CrmContext, Lead } from "./lead";
import { deliveryOf, needsStaff } from "@/views/inbox/inboxCompanion";

/*
   Today (CRM screen C01, Jodi's 9 Oct handoff; the WhatsMax writeup's "decision
   surface, not a reporting surface"). Built only from reads DreamOS already
   makes, with the same meanings the other Dojang pages use:

   - context         today's classes that haven't ended, the guardian messages
                     and their deliveries (the Inbox's read)
   - session_roster  each class's booked members, attendance and instructor
                     (Front Desk's arrivals)
   - crm_context     open CRM tasks and the leads' recorded evidence (Follow-ups);
                     owners and managers only

   Nothing here is AI. Instructor coverage, messages, deliveries and tasks are
   Odoo records; "leads without a next action" is Odoo's fixed evidence rule.
*/

export type TodaySession = HubContext["sessions"][number];

// Rosters are read for this many of today's classes at most (as on Front Desk)
export const ROSTER_LIMIT = 12;

// The Hub's context read sends at most this many messages (service.py _context)
const MESSAGE_LIMIT = 50;

// The CRM read as the page hands it over. "forbidden": this staff member's grant
// has no CRM access (instructors), so the CRM rows are left out, not an error.
export type TodayCrmRead =
  | { outcome: "loaded"; context: CrmContext }
  | { outcome: "forbidden" }
  | { outcome: "unavailable"; code: string | null; text: string };

// "4", or "at least 4" when the source sent only part of the list
export function countText(count: number, partial: boolean) {
  return partial ? `at least ${count}` : String(count);
}

// Starts today in the viewer's own time zone (staff are at the school), as on Front Desk
export function isToday(iso: string | null) {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

// Today's classes that haven't ended, soonest first (context sends them in that order)
export function remainingToday(context: HubContext): TodaySession[] {
  return context.sessions.filter((session) => isToday(session.startsAt));
}

// One class's roster in numbers: booked, here (present or late) and not arrived
// (booked, nothing recorded yet). Other recorded states (absent, excused…) are
// in booked only.
export function classCounts(roster: SessionRoster) {
  const members = roster.members;
  return {
    booked: members.length,
    here: members.filter((member) => ARRIVED_STATES.includes(member.attendance)).length,
    notArrived: members.filter((member) => EXPECTED_STATES.includes(member.attendance)).length,
  };
}

// Instructor coverage: today's classes whose roster says no instructor is
// assigned in Odoo. Classes whose roster wasn't read (or couldn't be) are
// counted apart, never as covered.
export function coverageOf(sessions: TodaySession[], rosters: Record<string, SessionRoster | null | undefined>) {
  const gaps: { session: TodaySession; roster: SessionRoster }[] = [];
  let unchecked = 0;
  sessions.forEach((session, index) => {
    const roster = index < ROSTER_LIMIT ? rosters[session.id] : null;
    if (!roster) unchecked += 1;
    else if (roster.session.instructor === null) gaps.push({ session, roster });
  });
  return { gaps, unchecked };
}

// Messages still waiting for staff (no reply approved yet), by their Hub state,
// with the Inbox's own rule (needsStaff)
export function messageWork(context: HubContext) {
  const counts: Record<MessageState, number> = { unmatched: 0, received: 0, resolved: 0 };
  for (const message of context.messages) {
    if (needsStaff(context, message)) counts[message.state] += 1;
  }
  const total = counts.unmatched + counts.received + counts.resolved;
  return { counts, total, partial: context.messages.length >= MESSAGE_LIMIT };
}

// Approved replies the provider reported failed, or that may or may not have
// been sent. The Hub never retries an uncertain one by itself.
export function deliveryProblems(context: HubContext) {
  const problems: { delivery: HubDelivery; message: HubMessage }[] = [];
  for (const message of context.messages) {
    const delivery = deliveryOf(context, message.id);
    if (delivery && (delivery.state === "failed" || delivery.state === "uncertain" || delivery.state === "cancelled")) {
      problems.push({ delivery, message });
    }
  }
  return { problems, partial: context.messages.length >= MESSAGE_LIMIT };
}

// Overdue CRM tasks, then those due today, in the Follow-ups page's order.
// null when this read has no tasks DreamOS can use.
export function dueFollowUps(crm: CrmContext) {
  const read = crm.followUps;
  if (read.outcome !== "loaded") return null;
  const inState = (state: FollowUp["state"]) =>
    read.tasks
      .filter((task) => task.state === state)
      .sort((a, b) => compareFollowUps(a, b, crm.leads));
  const overdue = inState("overdue");
  const today = inState("today");
  return { tasks: [...overdue, ...today], overdue: overdue.length, today: today.length, partial: read.moreTasks };
}

// Leads with no open task whose recorded evidence asks for one (Follow-ups'
// "Needs a next action"), from the latest leads this read sent
export function leadsNeedingNextAction(crm: CrmContext): { leads: Lead[]; partial: boolean } {
  return { leads: leadsWithoutNextAction(crm.leads), partial: crm.moreLeads };
}

// Everything Needs decision and the rail are built from. A part is null when
// its read didn't load (or, for the CRM, isn't this staff member's to see).
export type TodayWork = {
  crmExpected?: boolean;
  coverage: ReturnType<typeof coverageOf> | null;
  rostersPending: boolean; // some of the rosters are still being read
  messages: ReturnType<typeof messageWork> | null;
  deliveries: ReturnType<typeof deliveryProblems> | null;
  due: ReturnType<typeof dueFollowUps>;
  noNextAction: ReturnType<typeof leadsNeedingNextAction> | null;
};

// How many things need a decision, from the parts that loaded. Partial when a
// source hit its limit or a class's roster couldn't be checked.
export function decisionCount(work: TodayWork) {
  let count = 0;
  let partial = work.coverage === null || work.messages === null || work.deliveries === null || (work.crmExpected === true && (work.due === null || work.noNextAction === null));
  if (work.coverage) {
    count += work.coverage.gaps.length;
    partial ||= work.coverage.unchecked > 0;
  }
  if (work.deliveries) {
    count += work.deliveries.problems.length;
    partial ||= work.deliveries.partial;
  }
  if (work.messages) {
    count += work.messages.total;
    partial ||= work.messages.partial;
  }
  if (work.due) {
    count += work.due.tasks.length;
    partial ||= work.due.partial;
  }
  if (work.noNextAction) {
    count += work.noNextAction.leads.length;
    partial ||= work.noNextAction.partial;
  }
  return { count, partial };
}
