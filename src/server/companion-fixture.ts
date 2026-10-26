// DEVELOPMENT-ONLY Do For Me context. Fictional.
// Only src/integrations/companion.ts reads this, and only outside production.
//
// Ported from Companion 1cab554b src/integrations/mock/companion.ts (getContextFor
// and Maya's suggestion). As there, the facts are built from the records
// themselves (sample members and leads), never from mockup numbers. Suggestions:
// Maya's (from Companion), and a lead follow-up wherever the Hub's lead evidence
// recommends one (followUpSuggestion). It maps to the Hub's prepare_lead_action.

import type {
  CompanionContext,
  CompanionFocus,
  Suggestion,
} from "../domain/companion";
import type { LeadDetails, LeadTask } from "../domain/leadDetails";
import { membershipLabel } from "../domain/member-presentation";
import { devCrmContext, devLeadDetails } from "./crm-fixture";
import { devMembers } from "./member-fixture";

type Featured = { suggestion: Suggestion; summary: string };

// Only Maya (5001) has a scripted suggestion, same as Companion
const featuredByMember: Record<string, Featured> = {
  "5001": {
    summary: "One remaining curriculum requirement blocks testing eligibility.",
    suggestion: {
      id: "maya-poomsae",
      title: "Complete Poomsae evaluation tonight.",
      explanation:
        "Maya meets the attendance requirement (88%) and has completed her other curriculum items. The Poomsae evaluation is the last requirement before she's testing eligible, and Master Kim teaches her 5:45 class tonight.",
      actionLabel: "Schedule evaluation",
      capability: "member.prepare_promotion",
      risk: "medium",
      preview: [
        { label: "Evaluation", value: "Poomsae (forms)" },
        { label: "When", value: "Tonight · 5:45 Children Advanced" },
        { label: "Evaluator", value: "Master Kim" },
        { label: "Approval", value: "Instructor sign-off" },
      ],
    },
  },
};

const EMPTY = { suggestions: [], receipts: [] };

function peopleContext(): CompanionContext {
  const count = (state: string) =>
    devMembers.filter((member) => member.membershipState === state).length;
  return {
    ...EMPTY,
    label: "People context",
    intelTitle: "Members",
    intel: [
      { label: "Members", value: String(devMembers.length) },
      { label: "Active", value: String(count("active")) },
      { label: "Trial", value: String(count("trial")) },
      { label: "Lead", value: String(count("lead")) },
    ],
  };
}

function memberContext(memberId: string): CompanionContext | null {
  const member = devMembers.find((person) => person.id === memberId);
  if (!member) return null;

  const intel = [
    { label: "Membership", value: membershipLabel(member) },
    { label: "Rank", value: member.rank.name },
  ];
  if (member.testReadiness !== undefined) {
    intel.push({ label: "Test readiness", value: `${member.testReadiness}%` });
  }

  return {
    ...EMPTY,
    label: `Member context · ${member.name}`,
    intelTitle: "Member intelligence",
    intel,
    featured: featuredByMember[memberId],
  };
}

function salesContext(): CompanionContext {
  const { leads } = devCrmContext();
  const open = leads.filter((lead) => !lead.lostReason);
  return {
    ...EMPTY,
    label: "Sales context",
    intelTitle: "Pipeline",
    intel: [
      { label: "Open leads", value: String(open.length) },
      {
        label: "Trials booked",
        value: String(open.filter((lead) => lead.stage === "Trial booked").length),
      },
      { label: "Lost", value: String(leads.length - open.length) },
    ],
  };
}

// "Confirm trial with guardian · due today"
function describeTask(task: LeadTask) {
  if (task.state === "today") return `${task.summary} · due today`;
  if (task.state === "overdue") return `${task.summary} · overdue`;
  return `${task.summary} · due ${task.due}`;
}

// PROPOSED (DreamOS) rule for suggesting a lead follow-up: the Hub's own lead
// evidence recommends one (nextAction "follow_up") and no open next action is
// recorded. Built only from that evidence and the lead record; nothing is sent.
function followUpSuggestion(details: LeadDetails): Suggestion | null {
  const { lead, trial } = details;
  const evidence = lead.evidence;
  if (!evidence || lead.lostReason) return null;
  if (evidence.nextAction !== "follow_up" || evidence.openTasks > 0) return null;
  if (evidence.journey === "Won" || evidence.journey === "Lost") return null;

  return {
    id: `lead-follow-up:${lead.id}`,
    title: `Prepare a follow-up for ${lead.name}`,
    explanation: `${evidence.priorityReason} ${lead.name} is at ${lead.stage}, owned by ${lead.owner}${
      trial ? `, after a ${trial.title} trial` : ""
    }. A follow-up task records the next step for staff.`,
    actionLabel: "Prepare follow-up task",
    capability: "crm.lead.prepare_follow_up",
    risk: "low",
    review: "page",
    preview: [
      { label: "Creates", value: "One internal task on this lead in Odoo" },
      { label: "Task", value: `Prepare follow-up: ${lead.name}` },
      { label: "Assigned to", value: "You" },
      { label: "Message", value: "None. Nothing is sent to the lead." },
      { label: "Stage, booking, membership", value: "Unchanged" },
    ],
    evidence: [
      { label: "Priority", value: `${evidence.priority} · ${evidence.priorityReason}` },
      { label: "Recommended next action", value: "Follow-up" },
      { label: "Stage", value: lead.stage },
      { label: "Owner", value: lead.owner },
      { label: "Open tasks", value: String(evidence.openTasks) },
      { label: "Trial linked", value: evidence.trialLinked ? "Yes" : "No" },
    ],
  };
}

function leadContext(leadId: string): CompanionContext | null {
  const details = devLeadDetails(leadId);
  if (!details) return null;
  const { lead, tasks, trial, timeline } = details;
  const nextTask = tasks.find((task) => task.state !== "done");
  const suggestion = followUpSuggestion(details);

  // History: the Hub's receipts for Do For Me's lead write
  const receipts = timeline
    .filter((entry) => entry.action === "prepare_lead_action")
    .map((entry) => ({
      id: entry.id,
      suggestionId: `lead-follow-up:${lead.id}`,
      summary: "Prepared a follow-up task (no message sent)",
      actor: entry.actor,
      at: entry.at,
    }));

  const intel = [
    { label: "Stage", value: lead.lostReason ? `Lost · ${lead.stage}` : lead.stage },
    { label: "Owner", value: lead.owner },
    { label: "Next action", value: nextTask ? describeTask(nextTask) : "No open tasks" },
    { label: "Trial", value: trial ? trial.title : "Not booked" },
  ];
  if (lead.evidence) {
    intel.push({ label: "Priority", value: `${lead.evidence.priority} · ${lead.evidence.priorityReason}` });
  }

  return {
    suggestions: [],
    receipts,
    label: `Lead context · ${lead.name}`,
    intelTitle: "Lead",
    intel,
    featured: suggestion
      ? { suggestion, summary: lead.evidence?.priorityReason ?? suggestion.explanation }
      : undefined,
  };
}

// null for an unknown member or lead: a context never borrows another record's tasks
export function devCompanionContext(focus: CompanionFocus): CompanionContext | null {
  if (focus.kind === "people") return peopleContext();
  if (focus.kind === "member") return memberContext(focus.memberId);
  if (focus.kind === "sales") return salesContext();
  if (focus.kind === "lead") return leadContext(focus.leadId);
  // Inbox and message focus come from the Hub's own inbox read, built on the
  // inbox page (views/inbox/inboxCompanion.ts), not from this fixture
  return null;
}
