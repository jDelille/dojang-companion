import type { CompanionContext, Suggestion } from "./companion";
import type { LeadDetails, LeadTask } from "./leadDetails";

/*
   Do For Me on one lead: the lead's context for the rail and its one proposal,
   "Prepare a follow-up", built from the lead's record (the Hub's lead_details,
   or the development fixture in its shape). The same code for both, so sample
   and Odoo leads get the same proposal from the same evidence.

   The proposal is a FIXED RULE, not AI: it follows the lead's recorded evidence
   (Jodi's crm.py _lead_evidence, "v1-fixed-evidence"). It maps to the Hub's
   prepare_lead_action (kind "follow_up"): one internal task on the lead.
   Nothing is sent and nothing else changes. It only runs when staff press Apply
   on the review (views/crm/followUpReview.tsx).
*/

// The capability name Do For Me uses for this proposal (Paul's v1.2 capability list)
export const FOLLOW_UP_CAPABILITY = "crm.lead.prepare_follow_up";

// "Confirm trial with guardian · due today"
function describeTask(task: LeadTask) {
  if (task.state === "today") return `${task.summary} · due today`;
  if (task.state === "overdue") return `${task.summary} · overdue`;
  return `${task.summary} · due ${task.due}`;
}

// The rule: the Hub's own lead evidence recommends a follow-up (nextAction
// "follow_up") and records no open task, the lead isn't lost, and its journey
// isn't Won or Lost. Nothing else is scored here.
export function followUpSuggestion(details: LeadDetails): Suggestion | null {
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
    capability: FOLLOW_UP_CAPABILITY,
    risk: "low",
    basis: "rule",
    review: "page",
    preview: [
      { label: "Creates", value: "One internal follow-up task on this lead in Odoo" },
      { label: "Task", value: `Prepare follow-up: ${lead.name}` },
      { label: "Assigned to", value: "You" },
      { label: "Message", value: "None. Nothing is sent to the lead." },
      { label: "Stage", value: "Unchanged" },
      { label: "Booking", value: "None created" },
      { label: "Membership", value: "None created or changed" },
    ],
    evidence: [
      { label: "Basis", value: "Fixed Odoo rule · Not AI" },
      { label: "Priority", value: `${evidence.priority} · ${evidence.priorityReason}` },
      { label: "Recommended next action", value: "Follow-up" },
      { label: "Stage", value: lead.stage },
      { label: "Owner", value: lead.owner },
      { label: "Open tasks", value: String(evidence.openTasks) },
      { label: "Trial linked", value: evidence.trialLinked ? "Yes" : "No" },
    ],
  };
}

// The rail's lead context: the lead's facts, the follow-up proposal when the rule
// applies, and History from the Hub's own receipts for that write (the lead's
// timeline). No receipt is ever made up here.
export function leadCompanionContext(details: LeadDetails): CompanionContext {
  const { lead, tasks, trial, timeline } = details;
  const nextTask = tasks.find((task) => task.state !== "done");
  const suggestion = followUpSuggestion(details);

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
