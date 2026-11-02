import type { Risk } from "../companion";
import type { PrepareLeadActionPayload } from "../hubAction";
import type { Subject, SubjectKind } from "./definition";
import type { WorkflowRun } from "./run";

/*
   The business actions a workflow step may ask for, as governed Dojang
   capabilities, and the checks a step's conditions may make. The engine
   (engine.ts) never changes a record itself: it prepares one of these, waits
   for a staff member's approval, and hands the prepared Hub request to an
   ActionExecutor (src/integrations/workflowActions.ts), which sends it as
   that staff member. The Hub decides everything after that.

   Each of Roster's retention step actions (lib/retention-shared.ts
   ACTION_LABELS) is mapped below. Only one has a Hub contract today:
   create_task -> crm.lead.prepare_follow_up -> prepare_lead_action
   (kind follow_up). The rest are listed as NOT connected, with the contract
   each needs. A step that uses one can be written and dry-run, and is blocked
   when it is reached. Nothing stands in for it.
*/

// Every step's prepared request goes to a staff member to approve. Whether any
// capability may ever run unattended is a policy decision nobody has made.
export type ApprovalPolicy = "staff_approval";

// What an approved request turns into (the integration's job)
export type HubRequest = { operation: string; payload: Record<string, unknown> };

// How an action is carried out
//   hub            a Hub operation the DreamOS gateway forwards (hub-gateway.ts)
//   not_connected  no contract yet; the step is blocked when reached
export type ActionBinding =
  | {
      status: "hub";
      operation: string;
      // The Hub request for this subject and rendered input, or why it can't be made
      buildRequest: (subject: Subject, input: Record<string, string>, today: string) => HubRequest | { problem: string };
    }
  | { status: "not_connected"; contractNeeded: string };

export type ActionInput = {
  name: string;
  label: string;
  // text: free text, may use {{fields}}; days: a whole number of days from today
  type: "text" | "days";
  required: boolean;
  maxLength: number; // text only; days are 0-365
};

export type Fact = { label: string; value: string };

export type ActionSpec = {
  capability: string;
  label: string;
  subjectKinds: SubjectKind[];
  risk: Risk;
  approval: ApprovalPolicy;
  inputs: ActionInput[];
  // What will change, from the rendered input (shown in dry runs and approvals)
  changes: (input: Record<string, string>) => Fact[];
  // What will NOT change, always shown with the changes
  unchanged: Fact[];
  binding: ActionBinding;
  fromRoster: string; // the Roster step action it replaces
};

// "2026-11-02" plus 3 days -> "2026-11-05". today is the site's local date,
// which the caller supplies (the engine doesn't know the site's time zone).
export function addDays(today: string, days: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(today);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return date.toISOString().slice(0, 10);
}

// A "days" input as a number, or null when it isn't a whole number from 0 to 365
export function daysValue(value: string | undefined): number | null {
  if (value === undefined || !/^\d{1,3}$/.test(value)) return null;
  const days = Number(value);
  return days <= 365 ? days : null;
}

const NOTHING_SENT: Fact = { label: "Message", value: "None. Nothing is sent." };

function notConnected(
  capability: string,
  label: string,
  subjectKinds: SubjectKind[],
  risk: Risk,
  fromRoster: string,
  contractNeeded: string,
): ActionSpec {
  return {
    capability,
    label,
    subjectKinds,
    risk,
    approval: "staff_approval",
    inputs: [],
    changes: () => [],
    unchanged: [],
    binding: { status: "not_connected", contractNeeded },
    fromRoster,
  };
}

export const ACTIONS: ActionSpec[] = [
  {
    capability: "crm.lead.prepare_follow_up",
    label: "Prepare a follow-up task",
    subjectKinds: ["lead"],
    risk: "low",
    approval: "staff_approval",
    inputs: [
      { name: "reason", label: "Reason (the task's note)", type: "text", required: true, maxLength: 800 },
      { name: "dueInDays", label: "Due, days from today", type: "days", required: true, maxLength: 3 },
    ],
    changes: (input) => [
      { label: "Creates", value: "One internal follow-up task on the lead in Odoo" },
      { label: "Note", value: input.reason ?? "" },
      { label: "Due", value: `${input.dueInDays ?? "?"} days from today` },
      { label: "Assigned to", value: "The staff member who approves it" },
    ],
    unchanged: [
      NOTHING_SENT,
      { label: "Stage", value: "Unchanged" },
      { label: "Booking", value: "None created" },
      { label: "Membership", value: "None created or changed" },
    ],
    binding: {
      status: "hub",
      operation: "prepare_lead_action",
      buildRequest: (subject, input, today) => {
        if (subject.kind !== "lead") return { problem: "Only a lead can get a follow-up task." };
        if (subject.version === null) return { problem: "The lead's read has no version." };
        const days = daysValue(input.dueInDays);
        const due = days === null ? null : addDays(today, days);
        if (!due) return { problem: "The due date isn't valid." };
        const reason = (input.reason ?? "").trim();
        if (reason.length < 1 || reason.length > 800) return { problem: "The reason must be 1-800 characters." };
        const payload: PrepareLeadActionPayload = {
          leadId: subject.id,
          expectedVersion: subject.version,
          kind: "follow_up",
          reason,
          due,
        };
        return { operation: "prepare_lead_action", payload };
      },
    },
    fromRoster: "create_task",
  },
  notConnected(
    "communication.send",
    "Send a message (email, SMS, WhatsApp, push)",
    ["lead", "member"],
    "high",
    "send_email, send_sms, send_push",
    "A governed outbound draft -> approval -> WhatsMax delivery-queue operation for this subject, with consent and channel policy. Today only the guardian-reply workflow exists, and DreamOS forwards none of it.",
  ),
  notConnected(
    "crm.lead.tag",
    "Add or remove a lead tag",
    ["lead"],
    "low",
    "add_tag, remove_tag",
    "A Hub write that adds/removes a crm.tag on a lead, with expectedVersion.",
  ),
  notConnected(
    "crm.lead.change_stage",
    "Move the lead to another stage",
    ["lead"],
    "medium",
    "change_stage",
    "A Hub stage-change write for a lead (stage id read from crm_context), with expectedVersion.",
  ),
  notConnected(
    "member.prepare_follow_up",
    "Prepare a follow-up task on a member",
    ["member"],
    "low",
    "create_task",
    "A member counterpart of prepare_lead_action (one internal task on dojo.member, nothing sent).",
  ),
  notConnected(
    "staff.notify",
    "Notify the team",
    ["lead", "member"],
    "low",
    "notify_team",
    "A staff notification operation (Odoo activity/notification or push), scoped by site grants.",
  ),
  notConnected(
    "reputation.request_review",
    "Ask for a review",
    ["member"],
    "medium",
    "request_review",
    "A review-request capability through WhatsMax with consent, plus a review-link source.",
  ),
];

export function findAction(capability: string): ActionSpec | null {
  return ACTIONS.find((action) => action.capability === capability) ?? null;
}

// ── Conditions ───────────────────────────────────────────────────────────────

// A check is met, not met, or unknown (the fact wasn't in the read). Unknown
// never counts as either: the engine blocks the run.
export type CheckResult = "met" | "not_met" | "unknown";

export type ConditionSpec = {
  check: string;
  label: string;
  subjectKinds: SubjectKind[];
  evaluate: (subject: Subject, run: WorkflowRun | null) => CheckResult;
  fromRoster?: string;
};

function factIs(subject: Subject, fact: string, test: (value: string | number | boolean) => boolean): CheckResult {
  if (!(fact in subject.facts)) return "unknown";
  return test(subject.facts[fact]) ? "met" : "not_met";
}

export const CONDITIONS: ConditionSpec[] = [
  {
    check: "lead.has_open_task",
    label: "The lead already has an open task",
    subjectKinds: ["lead"],
    evaluate: (subject) => factIs(subject, "openTasks", (value) => typeof value === "number" && value > 0),
  },
  {
    check: "lead.closed",
    label: "The lead is won or lost",
    subjectKinds: ["lead"],
    evaluate: (subject) => factIs(subject, "closed", (value) => value === true),
  },
  {
    // Roster's skipIfReplied. No Hub read says when a lead or member last wrote
    // in, so the fact is never present and the check is always unknown.
    check: "subject.replied_since_enrolment",
    label: "They replied since the run started",
    subjectKinds: ["lead", "member"],
    evaluate: (subject, run) => {
      const last = subject.facts.lastInboundAt;
      if (typeof last !== "string" || !run) return "unknown";
      return last > run.enrolledAt ? "met" : "not_met";
    },
    fromRoster: "skipIfReplied",
  },
];

export function findCondition(check: string): ConditionSpec | null {
  return CONDITIONS.find((condition) => condition.check === check) ?? null;
}
