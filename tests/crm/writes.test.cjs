const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(process.env.DOJANG_CRM_BUILD, request.slice(2));
  return resolve.call(this, request, ...rest);
};
const { completeTask, addLeadNote, createLead, updateLead, assignLead } = require(path.join(process.env.DOJANG_CRM_BUILD, "integrations/crmWrites.js"));
const { changedLeadFields } = require(path.join(process.env.DOJANG_CRM_BUILD, 'domain/crmWrites.js'));
const key = "crm-0123456789-0123456789";
const task = { taskId: "501", expectedVersion: 123, feedback: "Outcome recorded." };
const note = { leadId: "42", expectedVersion: 456, note: "Internal context." };
const edit = { leadId: '42', expectedVersion: 456, changes: { name: 'Updated lead' } };
const assignment = { leadId: '42', expectedVersion: 456, ownerId: '7' };
let requests;
let reply;
test.beforeEach(() => {
  requests = [];
  global.fetch = async (url, init) => { requests.push({ url, ...JSON.parse(init.body) }); return reply(); };
});
const json = (body, status = 200) => () => new Response(JSON.stringify(body), { status });

test('assignment requires matching lead and owner receipts and sends the exact versioned request', async () => {
  reply = json({ leadId: '42', ownerId: '7', state: 'assigned', replayed: false });
  assert.equal((await assignLead(assignment, key)).outcome, 'done');
  assert.deepEqual(requests[0], { url: '/api/hub', operation: 'assign_lead', payload: assignment, requestKey: key });
  for (const result of [{ leadId: '43', ownerId: '7', state: 'assigned', replayed: false },
    { leadId: '42', ownerId: '8', state: 'assigned', replayed: false },
    { leadId: '42', ownerId: '7', state: 'pending', replayed: false }, { leadId: '42', ownerId: '7', state: 'assigned' }]) {
    reply = json(result);
    assert.equal((await assignLead(assignment, key)).outcome, 'notConfirmed');
  }
});

test('assignment diagnostics distinguish local origin rejection from Odoo denial without assuming a cause', async () => {
  for (const [stage, code] of [['origin', 'REQUEST_ORIGIN_REJECTED'], ['backend', 'ODOO_ASSIGNMENT_FORBIDDEN']]) {
    reply = () => new Response(JSON.stringify({ error: { code: 'FORBIDDEN' } }), { status: 403, headers: { 'x-dojang-hub-error-stage': stage } });
    assert.deepEqual(await assignLead(assignment, key), { outcome: 'failed', code });
  }
});

test('assignment forbids clearing the owner, extra authority fields and invalid versions before fetch', async () => {
  for (const payload of [{ ...assignment, ownerId: null }, { ...assignment, ownerId: '' }, { ...assignment, ownerId: '0' },
    { ...assignment, ownerId: 7 }, { ...assignment, siteId: '99' }, { ...assignment, expectedVersion: -1 }]) {
    assert.equal((await assignLead(payload, key)).code, 'INVALID_COMMAND');
  }
  assert.equal(requests.length, 0);
});

test('uncertain assignment can replay the exact request; permission and version failures stay explicit', async () => {
  reply = json({ error: { code: 'BACKEND_UNAVAILABLE' } }, 503);
  assert.equal((await assignLead(assignment, key)).outcome, 'notConfirmed');
  reply = json({ leadId: '42', ownerId: '7', state: 'assigned', replayed: true });
  assert.equal((await assignLead(assignment, key)).result.replayed, true);
  assert.deepEqual(requests[0], requests[1]);
  for (const code of ['FORBIDDEN', 'VERSION_CONFLICT', 'SIGN_IN_REQUIRED']) {
    reply = json({ error: { code } }, 409);
    assert.deepEqual(await assignLead(assignment, key), { outcome: 'failed', code });
  }
});

test('lead edits send only changed trimmed fields, leaving untouched shared contact fields out', () => {
  const original = { name: 'Lead', contact: '  Original contact  ', email: '', phone: '' };
  assert.deepEqual(changedLeadFields(original, { ...original, name: ' Updated lead ' }), { name: 'Updated lead' });
  assert.deepEqual(changedLeadFields(original, { ...original, name: 'Lead ' }), {});
  assert.deepEqual(changedLeadFields({ ...original, email: 'old@example.com' }, original), { email: '' });
});

test('lead updates validate identity/version receipts and preserve exact requests on uncertain retry', async () => {
  reply = json({ leadId: '42', version: 457, replayed: false });
  assert.equal((await updateLead(edit, key)).outcome, 'done');
  assert.deepEqual(requests[0], { url: '/api/hub', operation: 'update_lead', payload: edit, requestKey: key });
  for (const result of [{ leadId: '43', version: 457, replayed: false }, { leadId: '42', version: 455, replayed: false },
    { leadId: '42', version: 457 }, { leadId: '42', version: '457', replayed: false }]) {
    reply = json(result);
    assert.equal((await updateLead(edit, key)).outcome, 'notConfirmed');
  }
  global.fetch = async (url, init) => { requests.push(JSON.parse(init.body)); throw new Error('network'); };
  assert.equal((await updateLead(edit, key)).outcome, 'notConfirmed');
  reply = json({ leadId: '42', version: 457, replayed: true });
  global.fetch = async (url, init) => { requests.push(JSON.parse(init.body)); return reply(); };
  assert.equal((await updateLead(edit, key)).result.replayed, true);
  assert.deepEqual(requests.at(-1), requests.at(-2));
});

test('lead edits reject extra authority/stage fields, empty changes, invalid email and versions before fetch', async () => {
  for (const payload of [{ ...edit, changes: {} }, { ...edit, changes: { stageId: '7' } }, { ...edit, role: 'owner' },
    { ...edit, changes: { name: ' ' } }, { ...edit, changes: { email: 'bad' } },
    { ...edit, changes: { phone: 'x'.repeat(201) } }, { ...edit, expectedVersion: -1 }]) {
    assert.equal((await updateLead(payload, key)).code, 'INVALID_COMMAND');
  }
  assert.equal(requests.length, 0);
});

test('lead edit permission, shared-contact and version errors retain their authoritative state', async () => {
  for (const code of ['SHARED_CONTACT_REVIEW_REQUIRED', 'VERSION_CONFLICT', 'FORBIDDEN', 'SIGN_IN_REQUIRED']) {
    reply = json({ error: { code } }, code === 'SIGN_IN_REQUIRED' ? 401 : code === 'FORBIDDEN' ? 403 : 409);
    assert.deepEqual(await updateLead(edit, key), { outcome: 'failed', code });
  }
});

test("task completion requires confirmed task and linked-record identity, including member tasks", async () => {
  for (const kind of ["lead", "member"]) {
    reply = json({ taskId: "501", [`${kind}Id`]: "42", state: "done", replayed: false });
    assert.equal((await completeTask(task, { kind, id: "42" }, key)).outcome, "done");
  }
  for (const bad of [
    { taskId: "502", leadId: "42", state: "done", replayed: false },
    { taskId: "501", leadId: "43", state: "done", replayed: false },
    { taskId: "501", leadId: "42", memberId: "42", state: "done", replayed: false },
    { taskId: "501", leadId: "42", state: "pending", replayed: false },
  ]) {
    reply = json(bad);
    assert.equal((await completeTask(task, { kind: "lead", id: "42" }, key)).outcome, "notConfirmed");
  }
});
test("notes require a saved authoritative note identity and explicit no-message result", async () => {
  reply = json({ leadId: "42", noteId: "90", state: "saved", messageSent: false, replayed: false });
  assert.equal((await addLeadNote(note, key)).result.noteId, "90");
  for (const bad of [
    { leadId: "43", noteId: "90", state: "saved", messageSent: false, replayed: false },
    { leadId: "42", noteId: "90", state: "saved", messageSent: true, replayed: false },
    { leadId: "42", state: "saved", messageSent: false, replayed: false },
  ]) { reply = json(bad); assert.equal((await addLeadNote(note, key)).outcome, "notConfirmed"); }
});
test("uncertain outcomes never automatically retry; explicit retry carries original key and payload", async () => {
  reply = () => { throw new Error("Connection lost after commit"); };
  assert.equal((await addLeadNote(note, key)).outcome, "notConfirmed");
  assert.equal(requests.length, 1);
  reply = json({ leadId: "42", noteId: "90", state: "saved", messageSent: false, replayed: true });
  const answer = await addLeadNote(note, key);
  assert.equal(answer.result.replayed, true);
  assert.deepEqual(requests, [0, 1].map(() => ({ url: "/api/hub", operation: "add_lead_note", payload: note, requestKey: key })));
});
test("conflicts and permission/auth errors fail explicitly; busy/unavailable responses remain uncertain", async () => {
  for (const code of ["VERSION_CONFLICT", "IDEMPOTENCY_CONFLICT", "FORBIDDEN", "SIGN_IN_REQUIRED", "UNAUTHENTICATED", "AUTOMATED_TASK_REVIEW_REQUIRED"]) {
    reply = json({ error: { code } }, 409);
    assert.deepEqual(await completeTask(task, { kind: "lead", id: "42" }, key), { outcome: "failed", code });
  }
  for (const code of ["CONCURRENT_RETRY", "BACKEND_UNAVAILABLE", "BACKEND_UNAVAILABLE_RETRY_SAME_ACTION"]) {
    reply = json({ error: { code } }, 503);
    assert.equal((await addLeadNote(note, key)).outcome, "notConfirmed");
  }
  reply = () => new Response("not JSON", { status: 502 });
  assert.equal((await addLeadNote(note, key)).outcome, "notConfirmed");
});
test("invalid inputs never reach the gateway", async () => {
  assert.equal((await addLeadNote({ ...note, note: " " }, key)).code, "INVALID_COMMAND");
  assert.equal((await completeTask({ ...task, expectedVersion: -1 }, { kind: "lead", id: "42" }, key)).code, "INVALID_COMMAND");
  assert.equal((await addLeadNote(note, "short")).code, "INVALID_COMMAND");
  assert.equal(requests.length, 0);
});
test("a new lead needs a confirmed lead id and version; uncertain answers keep the same key", async () => {
  const lead = { name: "Maya Chen", contact: "", email: "", phone: "" };
  reply = json({ leadId: "9100", version: 1729000000000000, replayed: false });
  assert.equal((await createLead(lead, key)).result.leadId, "9100");
  for (const bad of [{ leadId: "0", version: 1, replayed: false }, { leadId: "9100", replayed: false }, { leadId: "9100", version: 1 }]) {
    reply = json(bad);
    assert.equal((await createLead(lead, key)).outcome, "notConfirmed");
  }
  reply = json({ error: { code: "FORBIDDEN" } }, 403);
  assert.deepEqual(await createLead(lead, key), { outcome: "failed", code: "FORBIDDEN" });
  assert.ok(requests.every((request) => request.operation === "create_lead" && request.requestKey === key));
  requests = [];
  assert.equal((await createLead({ ...lead, name: " " }, key)).code, "INVALID_COMMAND");
  assert.equal((await createLead({ ...lead, email: "nope" }, key)).code, "INVALID_COMMAND");
  assert.equal((await createLead({ ...lead, stageId: "4" }, key)).code, "INVALID_COMMAND");
  assert.equal(requests.length, 0);
});
