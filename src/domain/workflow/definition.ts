/*
   Companion workflows: what a workflow IS (its definition), separate from
   running it (engine.ts) and from the business actions its steps ask for
   (actions.ts). Pure data and checks: no Hub, no storage, no clock.

   Adapted from Roster 1.0.0's retention engine (docs/LICENSE-MAP.md):
   lib/retention-shared.ts (RetentionStep: action, delayMinutes, skipIfReplied),
   lib/retention.ts (renderTemplate, describeStep) and the Prisma
   RetentionRule/RetentionRun models. What changed and why:

   - A step names a governed Dojang capability ("crm.lead.prepare_follow_up"),
     never a mutation. Roster's steps send email/SMS and write Prisma rows
     themselves; here the step only says what to ask for, and actions.ts says
     whether the Hub can do it.
   - Skip conditions are named checks over facts the Hub read returned
     (Roster's skipIfReplied queried its own message table). A fact the read
     didn't return is unknown, and an unknown check stops the run instead of
     being guessed.
   - Templates fill only fields the subject's read actually has. Roster
     falls back to "there" or leaves "{{name}}" in the text; here a missing field
     blocks the step.
   - Where definitions and runs are stored is NOT decided (store.ts).
*/

// What a workflow runs on. Only kinds whose record Odoo has and the Hub reads.
export type SubjectKind = "lead" | "member";

export type SubjectRef = { kind: SubjectKind; id: string };

// A subject as one Hub read returned it, just before a step runs (subjects.ts).
//   version  the record's version for expectedVersion; null when the read has none
//   fields   text a template may use; a field the read didn't have is absent
//   facts    what skip conditions check; a fact the read didn't have is absent
export type Subject = SubjectRef & {
  version: number | null;
  fields: Record<string, string>;
  facts: Record<string, string | number | boolean>;
};

// The template fields each subject kind's read can fill (subjects.ts)
export const SUBJECT_FIELDS: Record<SubjectKind, string[]> = {
  lead: ["name", "contact", "stage", "owner"],
  member: ["name", "rank", "membership"],
};

// A check made just before a step runs. "then" says what happens when it's met:
//   skip_step  this step doesn't run, the run carries on (next step after its delay)
//   end_run    nothing more runs; the run completes (Roster's skipIfReplied)
export type StepCondition = { check: string; then: "skip_step" | "end_run" };

// One step. Delays are minutes after the previous step (Roster's delayMinutes),
// or after enrolment for the first step.
export type WorkflowStep =
  | { id: string; kind: "wait"; delayMinutes: number }
  | {
      id: string;
      kind: "action";
      capability: string; // actions.ts ACTIONS
      input: Record<string, string>; // may use {{field}} from SUBJECT_FIELDS
      delayMinutes: number;
      conditions: StepCondition[];
    };

// When a subject is enrolled. Only "manual" (staff enrol one record) is
// described here; scanning Odoo for matching records (Roster's 5-minute scan)
// needs a Hub read and a scheduler that don't exist (docs/WORKFLOW-ENGINE.md).
export type WorkflowTrigger = { type: "manual" };

export type WorkflowDefinition = {
  id: string;
  // A run keeps the version it was enrolled in. Changing a definition makes a
  // new version, so a run never switches steps halfway.
  version: number;
  name: string;
  subjectKind: SubjectKind;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  active: boolean;
};

// Longest delay one step may have: a year, in minutes
export const MAX_DELAY_MINUTES = 365 * 24 * 60;

const FIELD = /\{\{\s*(\w+)\s*\}\}/g;

// The {{fields}} a template uses
export function templateFields(template: string): string[] {
  const fields: string[] = [];
  for (const match of template.matchAll(FIELD)) fields.push(match[1]);
  return fields;
}

// Fills {{field}} from the subject. Returns the missing field names instead of
// text when any is absent: never a stand-in value.
export function renderTemplate(
  template: string,
  subject: Subject,
): { ok: true; text: string } | { ok: false; missing: string[] } {
  const missing = templateFields(template).filter((field) => !subject.fields[field]);
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true, text: template.replace(FIELD, (_match, field: string) => subject.fields[field]) };
}

// "after 3d", "after 4h", "after 15m", or "" for no delay (Roster's formatDelay)
export function formatDelay(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes < 60) return `after ${minutes}m`;
  if (minutes < 1440) return `after ${Math.round(minutes / 60)}h`;
  return `after ${Math.round(minutes / 1440)}d`;
}
