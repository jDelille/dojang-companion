import {
  ACTIONS,
  daysValue,
  findAction,
  findCondition,
  type ActionSpec,
  type CheckResult,
  type Fact,
  type HubRequest,
} from "./actions";
import {
  formatDelay,
  MAX_DELAY_MINUTES,
  renderTemplate,
  SUBJECT_FIELDS,
  templateFields,
  type Subject,
  type SubjectRef,
  type WorkflowDefinition,
  type WorkflowStep,
} from "./definition";
import {
  FINAL_STATUSES,
  type ActionExecutor,
  type LogEntry,
  type LogStatus,
  type WorkflowRun,
} from "./run";

/*
   The Companion workflow engine: pure functions from a run and its definition
   to the run's next state. It doesn't store anything, schedule anything or
   call the Hub. The caller loads and saves runs (store.ts), reads the subject
   through the Hub, and passes in the executor and clock.

   Adapted from Roster 1.0.0 workers/retentionSender.ts (runStep: load, check
   the rule is active, run one step, log it, schedule the next with its delay)
   and lib/retention.ts (executeStep's skip check before the action, its dry
   run, describeStep). What's different:

   1. A step never acts by itself. advance() PREPARES the step's Hub request
      and the run waits for a staff member. approve() hands that frozen request
      to the executor, which sends it as that staff member.
   2. A failed request is final (failed); nothing retries it. A request the Hub
      didn't confirm is "uncertain" and only retryUncertain(), called by a
      person, resends it, with the same key.
   3. Anything the engine can't know (no contract, a fact the read didn't
      have, a missing template field, a changed definition) blocks the run with
      the reason, instead of being skipped or guessed.
   4. One step per advance() call. Roster's worker also ran one step per job.
*/

// PROVISIONAL: how long to wait before reading an unreadable subject again
export const READ_RETRY_MINUTES = 15;

const addMinutes = (iso: string, minutes: number) => new Date(Date.parse(iso) + minutes * 60000).toISOString();

const stepDelay = (step: WorkflowStep) => step.delayMinutes;

function stepLabel(step: WorkflowStep) {
  if (step.kind === "wait") return "Wait";
  return findAction(step.capability)?.label ?? step.capability;
}

// ── Validation ───────────────────────────────────────────────────────────────

// Everything wrong with a definition, in words. [] means it can be saved and run.
// A capability that isn't connected is NOT a problem here: the dry run shows
// the step as blocked, and a run stops there.
export function validateDefinition(definition: WorkflowDefinition): string[] {
  const problems: string[] = [];
  if (!definition.id.trim()) problems.push("The workflow has no id.");
  if (!definition.name.trim()) problems.push("The workflow has no name.");
  if (!Number.isSafeInteger(definition.version) || definition.version < 1) {
    problems.push("The version must be a whole number from 1.");
  }
  if (definition.trigger.type !== "manual") problems.push("Only manual enrolment is supported.");
  if (definition.steps.length === 0) problems.push("The workflow has no steps.");

  const allowedFields = SUBJECT_FIELDS[definition.subjectKind];
  const seen = new Set<string>();

  definition.steps.forEach((step, index) => {
    const where = `Step ${index + 1}`;
    if (!step.id.trim()) problems.push(`${where} has no id.`);
    if (seen.has(step.id)) problems.push(`${where} repeats the id "${step.id}".`);
    seen.add(step.id);
    if (!Number.isSafeInteger(step.delayMinutes) || step.delayMinutes < 0 || step.delayMinutes > MAX_DELAY_MINUTES) {
      problems.push(`${where}'s delay must be 0 to ${MAX_DELAY_MINUTES} whole minutes.`);
    }
    if (step.kind === "wait") return;

    const action = findAction(step.capability);
    if (!action) {
      problems.push(`${where} uses "${step.capability}", which isn't a Dojang capability.`);
      return;
    }
    if (!action.subjectKinds.includes(definition.subjectKind)) {
      problems.push(`${where}: "${action.label}" can't be used on a ${definition.subjectKind}.`);
    }

    const inputNames = action.inputs.map((input) => input.name);
    for (const name of Object.keys(step.input)) {
      if (!inputNames.includes(name)) problems.push(`${where} has an input "${name}" that "${action.label}" doesn't take.`);
    }
    for (const input of action.inputs) {
      const value = step.input[input.name];
      if (value === undefined || value.trim() === "") {
        if (input.required) problems.push(`${where} needs "${input.label}".`);
        continue;
      }
      if (input.type === "days" && daysValue(value) === null) {
        problems.push(`${where}: "${input.label}" must be a whole number of days from 0 to 365.`);
      }
      if (input.type === "text") {
        for (const field of templateFields(value)) {
          if (!allowedFields.includes(field)) {
            problems.push(`${where}: {{${field}}} isn't a field a ${definition.subjectKind} has.`);
          }
        }
      }
    }

    for (const condition of step.conditions) {
      const spec = findCondition(condition.check);
      if (!spec) problems.push(`${where} checks "${condition.check}", which isn't a known condition.`);
      else if (!spec.subjectKinds.includes(definition.subjectKind)) {
        problems.push(`${where}: "${spec.label}" can't be checked on a ${definition.subjectKind}.`);
      }
    }
  });

  return problems;
}

// ── Resolving one step against one subject ───────────────────────────────────

type Resolution =
  | { outcome: "wait" }
  | { outcome: "skip"; detail: string }
  | { outcome: "end"; detail: string }
  | { outcome: "blocked"; detail: string }
  | { outcome: "prepare"; capability: string; request: HubRequest; changes: Fact[]; unchanged: Fact[] };

// The step's inputs with {{fields}} filled in, or why they can't be
function renderInputs(
  action: ActionSpec,
  step: { input: Record<string, string> },
  subject: Subject,
): { ok: true; input: Record<string, string> } | { ok: false; detail: string } {
  const input: Record<string, string> = {};
  for (const spec of action.inputs) {
    const value = step.input[spec.name];
    if (value === undefined) continue;
    if (spec.type === "days") {
      input[spec.name] = value;
      continue;
    }
    const rendered = renderTemplate(value, subject);
    if (!rendered.ok) {
      return { ok: false, detail: `The record has no ${rendered.missing.join(", ")} for "${spec.label}".` };
    }
    if (rendered.text.length > spec.maxLength) {
      return { ok: false, detail: `"${spec.label}" is longer than ${spec.maxLength} characters.` };
    }
    input[spec.name] = rendered.text;
  }
  return { ok: true, input };
}

// The step's conditions against the subject, in order. The first met one decides.
function checkConditions(
  step: Extract<WorkflowStep, { kind: "action" }>,
  subject: Subject,
  run: WorkflowRun | null,
): Resolution | null {
  for (const condition of step.conditions) {
    const spec = findCondition(condition.check);
    const result: CheckResult = spec ? spec.evaluate(subject, run) : "unknown";
    const label = spec?.label ?? condition.check;
    if (result === "unknown") {
      return { outcome: "blocked", detail: `Can't tell whether "${label}": the record's read doesn't say.` };
    }
    if (result === "met") {
      return condition.then === "end_run"
        ? { outcome: "end", detail: `${label}, so the workflow ends here.` }
        : { outcome: "skip", detail: `${label}, so this step is skipped.` };
    }
  }
  return null;
}

function resolveStep(
  step: WorkflowStep,
  definition: WorkflowDefinition,
  subject: Subject,
  run: WorkflowRun | null,
  today: string,
): Resolution {
  if (step.kind === "wait") return { outcome: "wait" };

  const action = findAction(step.capability);
  if (!action) return { outcome: "blocked", detail: `"${step.capability}" isn't a Dojang capability.` };
  if (subject.kind !== definition.subjectKind || !action.subjectKinds.includes(subject.kind)) {
    return { outcome: "blocked", detail: `"${action.label}" can't be used on this record.` };
  }

  const decided = checkConditions(step, subject, run);
  if (decided) return decided;

  if (action.binding.status === "not_connected") {
    return { outcome: "blocked", detail: `"${action.label}" isn't connected. Needs: ${action.binding.contractNeeded}` };
  }

  const rendered = renderInputs(action, step, subject);
  if (!rendered.ok) return { outcome: "blocked", detail: rendered.detail };

  const built = action.binding.buildRequest(subject, rendered.input, today);
  if ("problem" in built) return { outcome: "blocked", detail: built.problem };

  return {
    outcome: "prepare",
    capability: action.capability,
    request: built,
    changes: action.changes(rendered.input),
    unchanged: action.unchanged,
  };
}

// ── Dry run ──────────────────────────────────────────────────────────────────

export type PlannedOutcome =
  | "wait"
  | "needs_approval" // would be prepared for a staff member to approve
  | "would_skip"
  | "would_end"
  | "blocked"
  | "not_reached"; // an earlier step would end the run

export type PlannedStep = {
  stepIndex: number;
  stepId: string;
  label: string;
  delay: string; // "after 3d"
  dueAt: string | null; // when it would be due, counting delays from startAt
  outcome: PlannedOutcome;
  detail: string;
  changes: Fact[];
  unchanged: Fact[];
};

// What a run on this subject would do, step by step, without preparing or
// sending anything (Roster's dry run, which described each step instead of
// sending it). Conditions and fields are checked against this read of the
// subject; a real run checks them again when each step comes due.
// subject null: no record chosen, so only connection and inputs are checked.
export function dryRun(
  definition: WorkflowDefinition,
  subject: Subject | null,
  options: { today: string; startAt: string | null },
): PlannedStep[] {
  const plan: PlannedStep[] = [];
  let dueAt = options.startAt;
  let ended = false;

  definition.steps.forEach((step, stepIndex) => {
    if (dueAt) dueAt = addMinutes(dueAt, stepDelay(step));
    const base = { stepIndex, stepId: step.id, label: stepLabel(step), delay: formatDelay(step.delayMinutes), dueAt };

    if (ended) {
      plan.push({ ...base, outcome: "not_reached", detail: "An earlier step ends the workflow.", changes: [], unchanged: [] });
      return;
    }
    if (step.kind === "wait") {
      plan.push({ ...base, outcome: "wait", detail: "Waits, then goes on.", changes: [], unchanged: [] });
      return;
    }

    const action = findAction(step.capability);
    if (!subject) {
      if (!action || action.binding.status === "not_connected") {
        const detail = action && action.binding.status === "not_connected"
          ? `Not connected. Needs: ${action.binding.contractNeeded}`
          : `"${step.capability}" isn't a Dojang capability.`;
        plan.push({ ...base, outcome: "blocked", detail, changes: [], unchanged: [] });
        return;
      }
      plan.push({
        ...base,
        outcome: "needs_approval",
        detail: "Prepared for a staff member to approve. Fields and conditions are checked against the record when it runs.",
        changes: action.changes(step.input),
        unchanged: action.unchanged,
      });
      return;
    }

    const resolution = resolveStep(step, definition, subject, null, options.today);
    if (resolution.outcome === "prepare") {
      plan.push({
        ...base,
        outcome: "needs_approval",
        detail: "Prepared for a staff member to approve. Nothing changes until then.",
        changes: resolution.changes,
        unchanged: resolution.unchanged,
      });
    } else if (resolution.outcome === "skip") {
      plan.push({ ...base, outcome: "would_skip", detail: resolution.detail, changes: [], unchanged: [] });
    } else if (resolution.outcome === "end") {
      ended = true;
      plan.push({ ...base, outcome: "would_end", detail: resolution.detail, changes: [], unchanged: [] });
    } else if (resolution.outcome === "blocked") {
      plan.push({ ...base, outcome: "blocked", detail: resolution.detail, changes: [], unchanged: [] });
    }
  });

  return plan;
}

// ── Running ──────────────────────────────────────────────────────────────────

function withEntry(run: WorkflowRun, entry: Omit<LogEntry, "stepIndex" | "stepId">, definition: WorkflowDefinition) {
  const step = definition.steps[run.stepIndex];
  return [...run.log, { ...entry, stepIndex: run.stepIndex, stepId: step?.id ?? "" }];
}

// The run moved past its current step: the next one is due after its delay,
// or the run is complete
function moveOn(run: WorkflowRun, definition: WorkflowDefinition, now: string, log: LogEntry[]): WorkflowRun {
  const nextIndex = run.stepIndex + 1;
  const next = definition.steps[nextIndex];
  if (!next) return { ...run, stepIndex: nextIndex, status: "completed", nextRunAt: null, prepared: null, log };
  return {
    ...run,
    stepIndex: nextIndex,
    status: "pending",
    nextRunAt: addMinutes(now, stepDelay(next)),
    prepared: null,
    blockedReason: null,
    log,
  };
}

function block(run: WorkflowRun, definition: WorkflowDefinition, now: string, reason: string): WorkflowRun {
  return {
    ...run,
    status: "blocked",
    blockedReason: reason,
    nextRunAt: null,
    log: withEntry(run, { at: now, status: "blocked", detail: reason }, definition),
  };
}

// Can this run still use this definition?
function definitionProblem(run: WorkflowRun, definition: WorkflowDefinition): string | null {
  if (definition.id !== run.definitionId) return "This run belongs to a different workflow.";
  if (definition.version !== run.definitionVersion) {
    return `The workflow changed (version ${run.definitionVersion} -> ${definition.version}) after this run started.`;
  }
  return null;
}

// Starts a run on one subject. Its first step is due after that step's delay.
// Storage must refuse a second run of the same definition on the same subject
// (Roster's unique ruleId + contactId); see store.ts.
export function enrol(
  definition: WorkflowDefinition,
  subject: SubjectRef,
  options: { runId: string; now: string; actor: string },
): WorkflowRun | { problem: string } {
  const problems = validateDefinition(definition);
  if (problems.length > 0) return { problem: problems[0] };
  if (!definition.active) return { problem: "This workflow is switched off." };
  if (subject.kind !== definition.subjectKind) return { problem: `This workflow runs on a ${definition.subjectKind}.` };

  return {
    id: options.runId,
    definitionId: definition.id,
    definitionVersion: definition.version,
    subject: { kind: subject.kind, id: subject.id },
    enrolledAt: options.now,
    enrolledBy: options.actor,
    status: "pending",
    stepIndex: 0,
    nextRunAt: addMinutes(options.now, stepDelay(definition.steps[0])),
    prepared: null,
    blockedReason: null,
    log: [],
  };
}

export type AdvanceOptions = {
  now: string;
  today: string; // the site's local date, "2026-11-02"
  // The subject as the Hub reads it now, as whoever runs the engine; null when
  // it can't be read (Odoo down, no access). Reads are safe to retry, so an
  // unreadable subject is tried again later.
  readSubject: (subject: SubjectRef) => Promise<Subject | null>;
  newRequestKey: () => string;
};

// Runs a pending run's current step if it's due: a wait finishes, a condition
// skips or ends, or the action's request is prepared and the run waits for
// approval. Anything else leaves the run as it was.
export async function advance(run: WorkflowRun, definition: WorkflowDefinition, options: AdvanceOptions) {
  const { now } = options;
  if (run.status !== "pending" || !run.nextRunAt || run.nextRunAt > now) return run;

  const problem = definitionProblem(run, definition);
  if (problem) return block(run, definition, now, problem);
  if (!definition.active) {
    return {
      ...run,
      status: "cancelled" as const,
      nextRunAt: null,
      log: withEntry(run, { at: now, status: "cancelled", detail: "The workflow was switched off." }, definition),
    };
  }

  const step = definition.steps[run.stepIndex];
  if (!step) return { ...run, status: "completed" as const, nextRunAt: null };

  if (step.kind === "wait") {
    return moveOn(run, definition, now, withEntry(run, { at: now, status: "done", detail: "Waited." }, definition));
  }

  const subject = await options.readSubject(run.subject);
  if (!subject || subject.kind !== run.subject.kind || subject.id !== run.subject.id) {
    return {
      ...run,
      nextRunAt: addMinutes(now, READ_RETRY_MINUTES),
      log: withEntry(run, { at: now, status: "deferred", detail: "The record couldn't be read. Trying again later." }, definition),
    };
  }

  const resolution = resolveStep(step, definition, subject, run, options.today);
  if (resolution.outcome === "blocked") return block(run, definition, now, resolution.detail);
  if (resolution.outcome === "skip") {
    return moveOn(run, definition, now, withEntry(run, { at: now, status: "skipped", detail: resolution.detail }, definition));
  }
  if (resolution.outcome === "end") {
    const log = withEntry(run, { at: now, status: "ended", detail: resolution.detail }, definition);
    return { ...run, status: "completed" as const, nextRunAt: null, prepared: null, log };
  }
  if (resolution.outcome === "wait") {
    return moveOn(run, definition, now, withEntry(run, { at: now, status: "done", detail: "Waited." }, definition));
  }

  const requestKey = options.newRequestKey();
  return {
    ...run,
    status: "awaiting_approval" as const,
    nextRunAt: null,
    prepared: {
      stepIndex: run.stepIndex,
      requestKey,
      request: resolution.request,
      capability: resolution.capability,
      changes: resolution.changes,
      unchanged: resolution.unchanged,
      preparedAt: now,
    },
    log: withEntry(
      run,
      { at: now, status: "prepared", detail: `${stepLabel(step)}: waiting for approval.`, requestKey },
      definition,
    ),
  };
}

// Sends the prepared request and records what the Hub said
async function send(
  run: WorkflowRun,
  definition: WorkflowDefinition,
  options: { now: string; actor: string; execute: ActionExecutor },
  firstStatus: LogStatus,
) {
  const prepared = run.prepared;
  if (!prepared) return run;
  const { now, actor } = options;
  const requestKey = prepared.requestKey;

  // 1. Record who sent it, before sending
  const sent = { ...run, log: withEntry(run, { at: now, status: firstStatus, detail: "Sent to Odoo.", actor, requestKey }, definition) };

  // 2. Send exactly the prepared request, with its key
  const outcome = await options.execute(prepared.request, requestKey);

  // 3. Record what the Hub said
  if (outcome.status === "confirmed") {
    const detail = outcome.replayed ? "Odoo confirmed (a repeat of the earlier save)." : "Odoo confirmed.";
    const log = withEntry(sent, { at: now, status: "done", detail, actor, requestKey, receiptId: outcome.receiptId }, definition);
    return moveOn(sent, definition, now, log);
  }
  if (outcome.status === "rejected") {
    const detail = `Odoo refused it (${outcome.code}). Nothing changed.`;
    const log = withEntry(sent, { at: now, status: "failed", detail, actor, requestKey }, definition);
    return { ...sent, status: "failed" as const, nextRunAt: null, log };
  }
  const detail = "Odoo didn't confirm. It may have saved. Retry sends the same request.";
  const log = withEntry(sent, { at: now, status: "uncertain", detail, actor, requestKey }, definition);
  return { ...sent, status: "uncertain" as const, log };
}

// A staff member approves the prepared step: the executor sends it as them
export async function approve(
  run: WorkflowRun,
  definition: WorkflowDefinition,
  options: { now: string; actor: string; execute: ActionExecutor },
) {
  if (run.status !== "awaiting_approval" || !run.prepared) return run;
  const problem = definitionProblem(run, definition);
  if (problem) return block(run, definition, options.now, problem);
  return send(run, definition, options, "approved");
}

// A staff member resends an uncertain request, with the same key, so the Hub
// replays its first answer if it did save. Never called automatically.
export async function retryUncertain(
  run: WorkflowRun,
  definition: WorkflowDefinition,
  options: { now: string; actor: string; execute: ActionExecutor },
) {
  if (run.status !== "uncertain" || !run.prepared) return run;
  return send(run, definition, options, "approved");
}

// A staff member declines the prepared step. What declining means (skip this
// step, or stop the run) isn't decided, so the caller says which.
export function decline(
  run: WorkflowRun,
  definition: WorkflowDefinition,
  options: { now: string; actor: string; then: "skip_step" | "cancel_run" },
) {
  if (run.status !== "awaiting_approval") return run;
  const { now, actor } = options;
  const log = withEntry(run, { at: now, status: "declined", detail: "Declined. Nothing was sent to Odoo.", actor }, definition);
  if (options.then === "skip_step") return moveOn(run, definition, now, log);
  return { ...run, status: "cancelled" as const, nextRunAt: null, prepared: null, log };
}

// A staff member restarts a blocked run at the step it stopped on (after the
// missing contract or field exists). It is checked again from scratch.
export function resume(run: WorkflowRun, definition: WorkflowDefinition, options: { now: string; actor: string }) {
  if (run.status !== "blocked") return run;
  const log = withEntry(run, { at: options.now, status: "resumed", detail: "Resumed.", actor: options.actor }, definition);
  return { ...run, status: "pending" as const, nextRunAt: options.now, blockedReason: null, prepared: null, log };
}

// Stops a run. A prepared request that was never sent is dropped. An uncertain
// one may have saved in Odoo, so it can't be cancelled away: retry it first.
export function cancel(run: WorkflowRun, definition: WorkflowDefinition, options: { now: string; actor: string }) {
  if (FINAL_STATUSES.includes(run.status) || run.status === "uncertain") return run;
  const log = withEntry(run, { at: options.now, status: "cancelled", detail: "Cancelled.", actor: options.actor }, definition);
  return { ...run, status: "cancelled" as const, nextRunAt: null, prepared: null, log };
}

// The capabilities a definition uses that aren't connected yet, with the contract each needs
export function missingContracts(definition: WorkflowDefinition): { capability: string; contractNeeded: string }[] {
  const missing: { capability: string; contractNeeded: string }[] = [];
  for (const step of definition.steps) {
    if (step.kind !== "action") continue;
    const action = ACTIONS.find((item) => item.capability === step.capability);
    if (action && action.binding.status === "not_connected" && !missing.some((item) => item.capability === step.capability)) {
      missing.push({ capability: step.capability, contractNeeded: action.binding.contractNeeded });
    }
  }
  return missing;
}
