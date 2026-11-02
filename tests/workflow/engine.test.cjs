// Companion workflow engine (src/domain/workflow). Run with: bash tools/test-workflow-engine.sh
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const build = process.env.DOJANG_WORKFLOW_BUILD;
const engine = require(path.join(build, "domain/workflow/engine.js"));

const NOW = "2026-11-02T17:00:00.000Z";
const TODAY = "2026-11-02";
const HOUR = 60;
const DAY = 24 * HOUR;

const followUpStep = (overrides) => ({
  id: "follow-up",
  kind: "action",
  capability: "crm.lead.prepare_follow_up",
  input: { reason: "Check in with {{contact}} about {{name}}", dueInDays: "2" },
  delayMinutes: 0,
  conditions: [],
  ...overrides,
});

const definition = (steps, overrides) => ({
  id: "lead-follow-up",
  version: 1,
  name: "Lead follow-up",
  subjectKind: "lead",
  trigger: { type: "manual" },
  steps,
  active: true,
  ...overrides,
});

const lead = (overrides) => ({
  kind: "lead",
  id: "9001",
  version: 7,
  fields: { name: "Test Lead", contact: "Test Contact", stage: "New", owner: "Test Owner" },
  facts: { openTasks: 0, closed: false },
  ...overrides,
});

const subjectRef = { kind: "lead", id: "9001" };

function enrolled(workflow) {
  const run = engine.enrol(workflow, subjectRef, { runId: "run-1", now: NOW, actor: "Staff A" });
  assert.equal(run.problem, undefined);
  return run;
}

let keyCount = 0;
const advanceOptions = (overrides) => ({
  now: NOW,
  today: TODAY,
  readSubject: async () => lead(),
  newRequestKey: () => `wf-test-request-key-${++keyCount}`,
  ...overrides,
});

test("validation reports unknown capabilities, bad delays, inputs and fields", () => {
  const problems = engine.validateDefinition(
    definition([
      followUpStep({ id: "a", delayMinutes: -1 }),
      followUpStep({ id: "a", input: { reason: "Hi {{first_name}}", dueInDays: "x", extra: "1" } }),
      { id: "c", kind: "action", capability: "crm.lead.delete", input: {}, delayMinutes: 0, conditions: [] },
    ]),
  );
  assert.ok(problems.some((problem) => problem.includes("delay")));
  assert.ok(problems.some((problem) => problem.includes('repeats the id "a"')));
  assert.ok(problems.some((problem) => problem.includes("{{first_name}}")));
  assert.ok(problems.some((problem) => problem.includes("whole number of days")));
  assert.ok(problems.some((problem) => problem.includes('"extra"')));
  assert.ok(problems.some((problem) => problem.includes("crm.lead.delete")));
});

test("a not-connected capability is valid to write but blocked in the dry run", () => {
  const workflow = definition([
    { id: "send", kind: "action", capability: "communication.send", input: {}, delayMinutes: 0, conditions: [] },
  ]);
  assert.deepEqual(engine.validateDefinition(workflow), []);
  const plan = engine.dryRun(workflow, lead(), { today: TODAY, startAt: NOW });
  assert.equal(plan[0].outcome, "blocked");
  assert.match(plan[0].detail, /isn't connected/);
  assert.equal(engine.missingContracts(workflow)[0].capability, "communication.send");
});

test("dry run shows delays, what changes and what doesn't, and prepares nothing", () => {
  const workflow = definition([{ id: "wait", kind: "wait", delayMinutes: 3 * DAY }, followUpStep({ delayMinutes: 4 * HOUR })]);
  const plan = engine.dryRun(workflow, lead(), { today: TODAY, startAt: NOW });
  assert.equal(plan[0].outcome, "wait");
  assert.equal(plan[0].delay, "after 3d");
  assert.equal(plan[1].outcome, "needs_approval");
  assert.equal(plan[1].dueAt, "2026-11-05T21:00:00.000Z");
  assert.ok(plan[1].changes.some((fact) => fact.value === "Check in with Test Contact about Test Lead"));
  assert.ok(plan[1].unchanged.some((fact) => fact.label === "Message"));
});

test("dry run with an end_run condition marks later steps not reached", () => {
  const workflow = definition([
    followUpStep({ id: "one", conditions: [{ check: "lead.closed", then: "end_run" }] }),
    followUpStep({ id: "two" }),
  ]);
  const plan = engine.dryRun(workflow, lead({ facts: { openTasks: 0, closed: true } }), { today: TODAY, startAt: null });
  assert.equal(plan[0].outcome, "would_end");
  assert.equal(plan[1].outcome, "not_reached");
});

// advance() takes no executor at all: it can only prepare
test("a step is prepared for approval, never executed by advance", async () => {
  const workflow = definition([followUpStep()]);
  const run = await engine.advance(enrolled(workflow), workflow, advanceOptions());
  assert.equal(run.status, "awaiting_approval");
  assert.equal(run.prepared.request.operation, "prepare_lead_action");
  assert.deepEqual(run.prepared.request.payload, {
    leadId: "9001",
    expectedVersion: 7,
    kind: "follow_up",
    reason: "Check in with Test Contact about Test Lead",
    due: "2026-11-04",
  });
  assert.equal(run.log.at(-1).status, "prepared");
});

test("a step isn't run before its delay", async () => {
  const workflow = definition([followUpStep({ delayMinutes: DAY })]);
  const run = enrolled(workflow);
  const later = await engine.advance(run, workflow, advanceOptions());
  assert.equal(later, run);
  const due = await engine.advance(run, workflow, advanceOptions({ now: "2026-11-03T17:00:00.000Z" }));
  assert.equal(due.status, "awaiting_approval");
});

test("approval sends exactly the prepared request with its key; confirmed completes", async () => {
  const workflow = definition([followUpStep()]);
  const prepared = await engine.advance(enrolled(workflow), workflow, advanceOptions());
  const sent = [];
  const execute = async (request, requestKey) => {
    sent.push({ request, requestKey });
    return { status: "confirmed", receiptId: "task-1", replayed: false };
  };
  const done = await engine.approve(prepared, workflow, { now: NOW, actor: "Staff B", execute });
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].request, prepared.prepared.request);
  assert.equal(sent[0].requestKey, prepared.prepared.requestKey);
  assert.equal(done.status, "completed");
  const last = done.log.at(-1);
  assert.equal(last.status, "done");
  assert.equal(last.receiptId, "task-1");
  assert.equal(last.actor, "Staff B");
});

test("a refused request fails the run and is never retried", async () => {
  const workflow = definition([followUpStep(), followUpStep({ id: "two" })]);
  const prepared = await engine.advance(enrolled(workflow), workflow, advanceOptions());
  const failed = await engine.approve(prepared, workflow, {
    now: NOW,
    actor: "Staff B",
    execute: async () => ({ status: "rejected", code: "VERSION_CONFLICT" }),
  });
  assert.equal(failed.status, "failed");
  assert.equal(await engine.advance(failed, workflow, advanceOptions()), failed);
  assert.equal(await engine.retryUncertain(failed, workflow, { now: NOW, actor: "Staff B", execute: async () => assert.fail() }), failed);
});

test("an uncertain request is only resent by an explicit retry, with the same key", async () => {
  const workflow = definition([followUpStep()]);
  const prepared = await engine.advance(enrolled(workflow), workflow, advanceOptions());
  const keys = [];
  const uncertain = await engine.approve(prepared, workflow, {
    now: NOW,
    actor: "Staff B",
    execute: async (request, requestKey) => {
      keys.push(requestKey);
      return { status: "uncertain" };
    },
  });
  assert.equal(uncertain.status, "uncertain");
  assert.equal(await engine.advance(uncertain, workflow, advanceOptions()), uncertain);
  assert.equal(engine.cancel(uncertain, workflow, { now: NOW, actor: "Staff B" }), uncertain);

  const retried = await engine.retryUncertain(uncertain, workflow, {
    now: NOW,
    actor: "Staff C",
    execute: async (request, requestKey) => {
      keys.push(requestKey);
      return { status: "confirmed", receiptId: "task-1", replayed: true };
    },
  });
  assert.equal(keys[0], keys[1]);
  assert.equal(retried.status, "completed");
});

test("skip_step skips and schedules the next step after its delay", async () => {
  const workflow = definition([
    followUpStep({ id: "one", conditions: [{ check: "lead.has_open_task", then: "skip_step" }] }),
    followUpStep({ id: "two", delayMinutes: DAY }),
  ]);
  const run = await engine.advance(enrolled(workflow), workflow, advanceOptions({ readSubject: async () => lead({ facts: { openTasks: 2, closed: false } }) }));
  assert.equal(run.status, "pending");
  assert.equal(run.stepIndex, 1);
  assert.equal(run.nextRunAt, "2026-11-03T17:00:00.000Z");
  assert.equal(run.log.at(-1).status, "skipped");
});

test("an unknown condition blocks the run instead of guessing", async () => {
  const workflow = definition([followUpStep({ conditions: [{ check: "subject.replied_since_enrolment", then: "end_run" }] })]);
  const run = await engine.advance(enrolled(workflow), workflow, advanceOptions());
  assert.equal(run.status, "blocked");
  assert.match(run.blockedReason, /doesn't say/);
});

test("a missing template field blocks the step; nothing stands in for it", async () => {
  const workflow = definition([followUpStep()]);
  const run = await engine.advance(enrolled(workflow), workflow, advanceOptions({ readSubject: async () => lead({ fields: { name: "Test Lead" } }) }));
  assert.equal(run.status, "blocked");
  assert.match(run.blockedReason, /no contact/);
});

test("an unreadable subject defers the step without preparing anything", async () => {
  const workflow = definition([followUpStep()]);
  const run = await engine.advance(enrolled(workflow), workflow, advanceOptions({ readSubject: async () => null }));
  assert.equal(run.status, "pending");
  assert.equal(run.prepared, null);
  assert.equal(run.nextRunAt, "2026-11-02T17:15:00.000Z");
  assert.equal(run.log.at(-1).status, "deferred");
});

test("a run keeps its definition version; a changed definition blocks it", async () => {
  const workflow = definition([followUpStep()]);
  const run = enrolled(workflow);
  const blocked = await engine.advance(run, { ...workflow, version: 2 }, advanceOptions());
  assert.equal(blocked.status, "blocked");
  const resumed = engine.resume(blocked, workflow, { now: NOW, actor: "Staff A" });
  assert.equal(resumed.status, "pending");
});

test("declining is recorded and does what the caller chose", async () => {
  const workflow = definition([followUpStep(), followUpStep({ id: "two" })]);
  const prepared = await engine.advance(enrolled(workflow), workflow, advanceOptions());
  const skipped = engine.decline(prepared, workflow, { now: NOW, actor: "Staff B", then: "skip_step" });
  assert.equal(skipped.stepIndex, 1);
  assert.equal(skipped.status, "pending");
  const cancelled = engine.decline(prepared, workflow, { now: NOW, actor: "Staff B", then: "cancel_run" });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.prepared, null);
});

test("a switched-off workflow can't enrol and cancels its pending runs", async () => {
  const workflow = definition([followUpStep()]);
  const run = enrolled(workflow);
  assert.ok(engine.enrol({ ...workflow, active: false }, subjectRef, { runId: "run-2", now: NOW, actor: "Staff A" }).problem);
  const cancelled = await engine.advance(run, { ...workflow, active: false }, advanceOptions());
  assert.equal(cancelled.status, "cancelled");
});

test("lead subjects carry only what lead_details returned", () => {
  const subjects = require(path.join(build, "domain/workflow/subjects.js"));
  const subject = subjects.leadSubject({
    lead: { id: "9001", name: "Test Lead", contact: "", stage: "New", owner: "Test Owner", version: 3 },
    tasks: [],
    memberId: null,
    trial: null,
    notes: null,
    timeline: [],
  });
  assert.equal(subject.fields.contact, undefined);
  assert.equal("openTasks" in subject.facts, false);
  assert.equal("closed" in subject.facts, false);
});
