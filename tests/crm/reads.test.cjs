// Exercise the real integration parsers against contract-shaped Hub responses.
// No Odoo, credentials or network. React request caching is bypassed for isolation.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const build = process.env.DOJANG_CRM_BUILD;
let enabled = true;
let answer;
let calls = [];
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(build, request.slice(2));
  return originalResolve.call(this, request, ...rest);
};
const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === "react") return { cache: (fn) => fn };
  if (request === "@/server/hub-gateway") return {
    hubEnabled: () => enabled,
    readHubAsStaff: async (operation, payload) => { calls.push({ operation, payload }); return answer; },
  };
  return originalLoad.call(this, request, ...rest);
};
const load = (name, hub = true) => {
  enabled = hub;
  calls = [];
  const file = path.join(build, `integrations/${name}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
};
const memberResult = (changes = {}) => ({ member: { id: "42", name: "Test Member", state: "active", rank: "White" }, bookings: [], attendance: [], limits: { bookings: 10, attendance: 30 }, ...changes });

test("pipeline search uses one scoped crm_context query and preserves a confirmed empty list", async () => {
  const { getCrmContext } = load("crm");
  answer = { ok: true, result: { stages: [], leads: [], moreLeads: false } };
  const result = await getCrmContext("  Jordan  ");
  assert.equal(result.outcome, "loaded");
  assert.deepEqual(result.context.leads, []);
  assert.deepEqual(calls, [{ operation: "crm_context", payload: { query: "Jordan" } }]);
});
test("an overlong CRM query is refused before a Hub read", async () => {
  const { getCrmContext } = load("crm");
  assert.equal((await getCrmContext("x".repeat(101))).code, "INVALID_COMMAND");
  assert.equal(calls.length, 0);
});
test("real search errors never return development leads", async () => {
  const { getCrmContext } = load("crm");
  answer = { ok: false, code: "SIGN_IN_REQUIRED" };
  const result = await getCrmContext("Jordan");
  assert.equal(result.outcome, "unavailable");
  assert.equal(result.code, "SIGN_IN_REQUIRED");
  assert.equal(result.context, undefined);
});
test("fixture searches preserve the unfiltered fixture for the next read", async () => {
  const { getCrmContext } = load("crm", false);
  const before = await getCrmContext();
  assert.ok(before.context.leads.length > 0);
  const name = before.context.leads.find((lead) => !lead.lostReason).name;
  const found = await getCrmContext(name);
  assert.ok(found.context.leads.some((lead) => lead.name === name));
  const after = await getCrmContext();
  assert.deepEqual(after.context.leads, before.context.leads);
  assert.equal(calls.length, 0);
});
test("member identity mismatch fails closed before exposing contacts", async () => {
  const { getMemberRecord } = load("member");
  answer = { ok: true, result: memberResult({ member: { id: "43", name: "Wrong Member", state: "active", rank: "White", phone: "private" } }) };
  const result = await getMemberRecord("42");
  assert.equal(result.outcome, "unavailable");
  assert.equal(result.member, undefined);
});
test("malformed booking dates remain unavailable rather than a shorter count", async () => {
  const { getMemberRecord } = load("member");
  answer = { ok: true, result: memberResult({ bookings: [{ sessionId: "9", title: "Class", startsAt: "not-a-date" }] }) };
  const result = await getMemberRecord("42");
  assert.equal(result.outcome, "loaded");
  assert.equal(result.member.bookings, undefined);
});
test("member reads preserve complete zero and unknown zero; hidden contacts stay absent", async () => {
  const { getMemberRecord } = load("member");
  answer = { ok: true, result: memberResult() };
  const exact = await getMemberRecord("42");
  assert.deepEqual(exact.attendance.lastSevenDays, { count: 0, complete: true });
  assert.equal(exact.member.bookingsCapped, false);
  assert.equal(exact.member.phone, undefined);
  answer = { ok: true, result: memberResult({ limits: {} }) };
  const unknown = await getMemberRecord("42");
  assert.deepEqual(unknown.attendance.lastSevenDays, { count: 0, complete: false });
  assert.equal(unknown.member.bookingsCapped, true);
});

const leadDetails = (tasks) => ({
  lead: { id: "42", name: "Lead", contact: "Contact", email: "", phone: "", version: 123, stageId: "1", stage: "New", ownerId: null, owner: "Unassigned", source: "Web", tags: [] },
  tasks, timeline: [], trial: null, memberId: null, notes: [{ id: "90", text: "Saved internal note", author: "Owner", at: "2026-11-02T12:00:00Z" }],
});
const leadTask = { id: "501", relatedType: "lead", relatedId: "42", summary: "Call", due: "2026-11-03", owner: "Owner", state: "planned", version: 789, canComplete: true, feedback: "" };
test("lead reads retain authoritative completion permission, task version and saved notes", async () => {
  const { getLeadDetails } = load("crm");
  answer = { ok: true, result: leadDetails([leadTask]) };
  const result = await getLeadDetails("42");
  assert.equal(result.outcome, "loaded");
  assert.equal(result.details.tasks[0].version, 789);
  assert.equal(result.details.tasks[0].canComplete, true);
  assert.equal(result.details.notes[0].id, "90");
  assert.equal(result.details.notes[0].author, "Owner");
});
test("mismatched task linkage or malformed write versions fail closed", async () => {
  const { getLeadDetails } = load("crm");
  for (const changes of [{ relatedId: "43" }, { relatedType: "member" }, { version: 1.5 }, { version: -1 }, { canComplete: "yes" }]) {
    answer = { ok: true, result: leadDetails([{ ...leadTask, ...changes }]) };
    assert.equal((await getLeadDetails("42")).code, "HUB_RESPONSE_UNREADABLE");
  }
});
test("legacy task reads remain visible but cannot acquire completion authority from absent fields", async () => {
  const { getLeadDetails } = load("crm");
  const { relatedId, relatedType, version, canComplete, ...legacy } = leadTask;
  answer = { ok: true, result: leadDetails([legacy]) };
  const result = await getLeadDetails("42");
  assert.equal(result.outcome, "loaded");
  assert.equal(result.details.tasks[0].version, undefined);
  assert.equal(result.details.tasks[0].canComplete, undefined);
  answer = { ok: true, result: leadDetails([{ ...legacy, canComplete: true, version }]) };
  assert.equal((await getLeadDetails("42")).details.tasks[0].canComplete, false);
});
