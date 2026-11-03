// The DreamOS Hub gateway's allowlist (src/server/hub-gateway.ts): which
// operations reach Odoo and which are refused before they do. Odoo is a fake
// fetch here; nothing leaves this machine. Run by tools/test-hub-gateway.sh.
const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");

// Map "@/..." to the compiled build, and stub next/headers (only readHubAsStaff
// uses it, and these tests don't)
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(process.env.DOJANG_GATEWAY_BUILD, request.slice(2));
  return resolve.call(this, request, ...rest);
};
const load = Module._load;
const revalidated = [];
Module._load = function (request, ...rest) {
  if (request === "next/headers") return { cookies: async () => ({ get: () => undefined }) };
  if (request === "next/cache") return { revalidatePath: (route) => revalidated.push(route) };
  return load.call(this, request, ...rest);
};

const ORIGIN = "http://localhost:3000";
Object.assign(process.env, {
  DOJANG_PUBLIC_ORIGIN: ORIGIN,
  DOJANG_ODOO_URL: "http://127.0.0.1:8074",
  DOJANG_ODOO_DATABASE: "dojang_test",
  DOJANG_HUB_SITE_ID: "1",
  DOJANG_COOKIE_SECRET: "test-cookie-secret-0123456789abcdef",
});

const { hubRoute } = require(path.join(process.env.DOJANG_GATEWAY_BUILD, "server/hub-gateway.js"));

// The fake Odoo: records every Hub call it gets
const hubCalls = [];
let hubReply;
global.fetch = async (url, init) => {
  const params = JSON.parse(init.body).params;
  if (String(url).endsWith("/web/session/authenticate")) {
    return new Response(JSON.stringify({ jsonrpc: "2.0", result: { uid: 7 } }), {
      headers: { "content-type": "application/json", "set-cookie": `session_id=${"s".repeat(40)}; Path=/` },
    });
  }
  hubCalls.push(params);
  let result = { principal: { userId: "7", name: "Test Owner", role: "owner", siteId: "1" } };
  if (params.operation === "prepare_lead_action") {
    result = {
      leadId: params.payload.leadId, taskId: "501", kind: "follow_up", state: "prepared",
      messageSent: false, bookingCreated: false, membershipCreated: false, replayed: false,
    };
  }
  if (params.operation === "complete_task") result = { taskId: params.payload.taskId, leadId: "9008", state: "done", replayed: false };
  if (params.operation === "add_lead_note") result = { leadId: params.payload.leadId, noteId: "91", state: "saved", messageSent: false, replayed: false };
  if (params.operation === "create_lead") result = { leadId: "9100", version: 1729000000000000, replayed: false };
  if (hubReply) result = hubReply;
  return new Response(JSON.stringify({ jsonrpc: "2.0", result }), { headers: { "content-type": "application/json" } });
};

const post = (body, cookie) =>
  hubRoute(
    new Request(`${ORIGIN}/api/hub`, {
      method: "POST",
      headers: { origin: ORIGIN, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    }),
  );

const KEY = "dfm-0b6f6a2e-5c1d-4d8a-9f7e-123456789abc";
const INTAKE = { studentType: 'adult', student: { name: 'Prospect', email: 'p@example.invalid', phone: '', dateOfBirth: '2000-01-01', gender: '' }, guardian: null, reviewRef: 'Identity checked' };
const ATTENDANCE = { trialId: '7', expectedVersion: 30, outcome: 'attended', reason: 'Staff verified attendance' };
const STAGE_PROPOSAL = { leadId: '3', expectedVersion: 10, stageId: '9', reason: 'Trial #7 attended; review stage', due: '2026-11-04' };
const PAYLOAD = { leadId: "9008", expectedVersion: 1729000000000000, kind: "follow_up", reason: "No open next action.", due: "2026-10-29" };

let cookie = "";
test.before(async () => {
  const response = await post({ operation: "login", login: "owner", password: "secret" });
  assert.equal(response.status, 200);
  cookie = /dojang_hub_session=[^;]+/.exec(response.headers.get("set-cookie"))[0];
  hubCalls.length = 0;
});
test.beforeEach(() => {
  hubCalls.length = 0;
  revalidated.length = 0;
  hubReply = undefined;
});

async function errorOf(response) {
  return (await response.json()).error.code;
}

test('completion workflows recognize only exact named financial and student-specific testing commands', async () => {
  for (const operation of ['request_refund', 'approve_refund', 'record_refund_payment', 'cancel_refund', 'save_testing_roster', 'record_test_results', 'promote_test_results', 'reverse_promotion']) {
    assert.equal((await post({ operation, payload: {}, requestKey: KEY }, cookie)).status, 400, operation);
    assert.equal((await post({ operation, payload: {}, requestKey: KEY })).status, 401, operation);
  }
  assert.equal(hubCalls.length, 0);
});
test('completion reads forward exact contracts and reject scope overrides and request keys', async () => {
  for (const [operation, payload] of [['member_onboarding', { memberId: '5' }], ['billing_ledger', { memberId: '5' }], ['refund_preview', { memberId: '5', invoiceId: '9' }], ['testing_roster', { testId: '7' }], ['promotion_preview', { testId: '7', registrationIds: ['10'] }], ['promotion_history', { query: 'Student' }]]) {
    assert.equal((await post({ operation, payload, requestKey: null }, cookie)).status, 200, operation);
    assert.deepEqual(hubCalls.at(-1), { siteId: '1', operation, payload, requestKey: null });
    const count = hubCalls.length;
    assert.equal((await post({ operation, payload: { ...payload, role: 'owner' }, requestKey: null }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 400);
    assert.equal(hubCalls.length, count);
  }
});
test('refund review commands preserve native effects and authoritative refund identity, including shared invoices', async () => {
  const payload = { refundId: '8', expectedVersion: 1, reason: 'Owner approved whole-invoice refund' };
  hubReply = { memberId: '6', refundId: '8', state: 'refund_approved', moneyReturned: false, creditNotePosted: true, creditNote: 'CN/1', next: 'awaiting_refund_payment', version: 2, replayed: false };
  const body = { operation: 'approve_refund', payload, requestKey: KEY };
  assert.equal((await post(body, cookie)).status, 200);
  assert.deepEqual(hubCalls[0], { siteId: '1', operation: 'approve_refund', payload, requestKey: KEY });
  assert.ok(revalidated.includes('/people/6'));
  revalidated.length = 0;
  hubReply = { ...hubReply, refundId: '99' };
  await post(body, cookie); assert.equal(revalidated.length, 0);
  hubReply = { error: { code: 'FORBIDDEN', status: 403 } };
  assert.equal((await post(body, cookie)).status, 403); assert.equal(revalidated.length, 0);
  assert.equal((await post({ ...body, role: 'owner' }, cookie)).status, 400);
  assert.equal((await post({ ...body, subjectId: '5' }, cookie)).status, 400, 'Client selection metadata is not a backend authority field');
});
test('testing commands allow a single reviewed registration and verify test/result identities before invalidation', async () => {
  const payload = { testId: '7', expectedVersion: 1, results: [{ registrationId: '10', result: 'pass' }], reason: 'Staff assessment' };
  hubReply = { testId: '7', state: 'test_results_saved', reason: payload.reason, changes: [{ registrationId: '10', before: 'pending', after: 'pass' }], version: 2, replayed: false };
  assert.equal((await post({ operation: 'record_test_results', payload, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls[0].payload, payload);
  hubCalls.length = 0;
  for (const bad of [{ ...payload, results: [...payload.results, { registrationId: '11', result: 'pass' }] }, { ...payload, expectedVersion: -1 }, { ...payload, memberId: '5' }]) {
    assert.equal((await post({ operation: 'record_test_results', payload: bad, requestKey: KEY }, cookie)).status, 400);
  }
  assert.equal(hubCalls.length, 0);
  const promote = { testId: '7', expectedVersion: 2, registrationIds: ['10'], reason: 'Promotion reviewed', reviewToken: 'a'.repeat(64) };
  hubReply = { testId: '7', state: 'promotions_awarded', reason: promote.reason, promotions: [{ rankHistoryId: '20', memberId: '5', rank: 'Yellow' }], messageSent: false, invoiceCreated: false, version: 3, replayed: false };
  revalidated.length = 0;
  await post({ operation: 'promote_test_results', payload: promote, requestKey: KEY }, cookie);
  assert.ok(revalidated.includes('/people/5'));
  revalidated.length = 0; hubReply = { ...hubReply, testId: '8' };
  await post({ operation: 'promote_test_results', payload: promote, requestKey: KEY }, cookie);
  assert.equal(revalidated.length, 0);
});

test('Member 360 named commands are recognized but refuse invalid payloads, missing auth and scope overrides', async () => {
  for (const operation of ['update_member', 'book', 'checkout', 'rank', 'update_member_photo', 'payment_link', 'archive_member', 'restore_member', 'mark_attendance', 'set_guardian_kiosk_pin', 'revoke_guardian_kiosk_pin', 'record_consent', 'link_guardian', 'sign_waiver', 'assign_course_members']) {
    assert.equal((await post({ operation, payload: {}, requestKey: KEY }, cookie)).status, 400, operation);
    assert.equal((await post({ operation, payload: {}, requestKey: KEY })).status, 401, operation);
  }
  const payload = { memberId: '5', sessionId: '118', expectedVersion: 1 };
  assert.equal((await post({ operation: 'book', payload: { ...payload, actorId: '99' }, requestKey: KEY }, cookie)).status, 400);
  assert.equal((await post({ operation: 'book', payload, requestKey: null }, cookie)).status, 400);
  assert.equal(hubCalls.length, 0);
});
test('Member 360 core writes forward exact commands, preserve identity, and invalidate after authoritative commit only', async () => {
  const cases = [
    ['update_member', { memberId: '5', expectedVersion: 1, expectedPartnerVersion: 2, changes: { phone: '' } }, { memberId: '5', state: 'updated', version: 3, replayed: false }],
    ['book', { memberId: '5', sessionId: '118', expectedVersion: 1 }, { memberId: '5', sessionId: '118', enrollmentId: '74', state: 'registered', replayed: false }],
    ['mark_attendance', { memberId: '5', sessionId: '118', expectedVersion: 1, status: 'present', reason: 'Observed' }, { memberId: '5', sessionId: '118', state: 'attendance_recorded', logId: '9', before: 'pending', after: 'present', reason: 'Observed', reversal: false, version: 2, replayed: false }],
  ];
  for (const [operation, payload, receipt] of cases) {
    hubCalls.length = 0; revalidated.length = 0; hubReply = receipt;
    assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 200);
    assert.deepEqual(hubCalls[0], { siteId: '1', operation, payload, requestKey: KEY });
    assert.ok(revalidated.includes('/people/5'));
    revalidated.length = 0; hubReply = { ...receipt, memberId: '6' };
    await post({ operation, payload, requestKey: KEY }, cookie);
    assert.equal(revalidated.length, 0);
  }
});
test('Member workspace strips the BFF section before Odoo and only returns the requested section', async () => {
  hubReply = { member: { id: '5', name: 'Student' }, canEdit: true, family: { household: 'Family', members: [], householdGuardians: [], guardians: [] }, safety: { allergies: 'private medical value', medicalNotes: 'private', emergencyNote: null, contacts: [] } };
  const response = await post({ operation: 'member_workspace', payload: { memberId: '5', section: 'family' }, requestKey: null }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls[0], { siteId: '1', operation: 'member_workspace', payload: { memberId: '5' }, requestKey: null });
  const projected = await response.json();
  assert.equal(projected.memberId, '5'); assert.equal(JSON.stringify(projected).includes('private'), false); assert.equal('safety' in projected, false);
  hubReply = { ...hubReply, canEdit: false };
  const denied = await (await post({ operation: 'member_workspace', payload: { memberId: '5', section: 'safety' }, requestKey: null }, cookie)).json();
  assert.equal(denied.data, null); assert.equal(denied.unavailable, 'restricted');
  hubReply.member.id = '6';
  assert.equal((await post({ operation: 'member_workspace', payload: { memberId: '5', section: 'family' }, requestKey: null }, cookie)).status, 502);
});
test('Member-specific reads reject keys, unknown sections and browser-supplied authority before Odoo', async () => {
  for (const [operation, payload] of [['member_workspace', { memberId: '5', section: 'safety', role: 'owner' }], ['member_workspace', { memberId: '5', section: 'all' }], ['archive_review', { memberId: '5', siteId: '99' }], ['attendance_sheet', { sessionId: '118', memberId: '5' }], ['course_roster', { templateId: '1', query: '' }], ['consent_overview', { memberId: '5', partnerId: '7' }]]) {
    assert.equal((await post({ operation, payload, requestKey: null }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'waiver_context', payload: { memberId: '5' }, requestKey: KEY }, cookie)).status, 400);
  assert.equal(hubCalls.length, 0);
});
test('invoice checkout refuses mismatched origins before returning a signed payment URL', async () => {
  const payload = { memberId: '5', invoiceId: '9', expectedVersion: 1, expectedAmount: 50 };
  hubReply = { memberId: '5', invoiceId: '9', state: 'checkout_ready', amount: 50, currency: 'USD', checkoutUrl: 'https://unapproved.example.invalid/my/invoices/9?access_token=demo', replayed: false };
  const response = await post({ operation: 'payment_link', payload, requestKey: KEY }, cookie);
  assert.equal(response.status, 422); assert.equal(await errorOf(response), 'PAYMENT_URL_NOT_CONFIGURED'); assert.equal(revalidated.length, 0);
});

test('propose_stage forwards the exact review-task contract and invalidates only a matching unchanged-stage receipt', async () => {
  hubReply = { leadId: '3', taskId: '91', state: 'proposed', stageChanged: false, replayed: false };
  assert.equal((await post({ operation: 'propose_stage', payload: STAGE_PROPOSAL, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls[0], { siteId: '1', operation: 'propose_stage', payload: STAGE_PROPOSAL, requestKey: KEY });
  assert.ok(revalidated.includes('/crm/leads/3'));
  revalidated.length = 0;
  for (const wrong of [{ ...hubReply, leadId: '4' }, { ...hubReply, stageChanged: true }]) {
    hubReply = wrong;
    await post({ operation: 'propose_stage', payload: STAGE_PROPOSAL, requestKey: KEY }, cookie);
    assert.equal(revalidated.length, 0);
  }
});
test('propose_stage rejects direct-change flags, overrides, invalid dates, missing key and unauthenticated calls', async () => {
  for (const bad of [{ ...STAGE_PROPOSAL, stageChanged: true }, { ...STAGE_PROPOSAL, actorId: '5' }, { ...STAGE_PROPOSAL, due: '2026-02-30' }, { ...STAGE_PROPOSAL, reason: 'x'.repeat(121) }, { ...STAGE_PROPOSAL, expectedVersion: -1 }]) {
    assert.equal((await post({ operation: 'propose_stage', payload: bad, requestKey: KEY }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'propose_stage', payload: STAGE_PROPOSAL, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: 'propose_stage', payload: STAGE_PROPOSAL, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
});

test('trial attendance forwards only the named attended action and invalidates committed receipt identities', async () => {
  hubReply = { trialId: '7', leadId: '3', memberId: '42', sessionId: '101', attendanceId: '90', state: 'trial_attended', reason: ATTENDANCE.reason, stageChanged: false, messageSent: false, noShowFollowUpScheduled: false, replayed: false };
  assert.equal((await post({ operation: 'record_trial_outcome', payload: ATTENDANCE, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls[0], { siteId: '1', operation: 'record_trial_outcome', payload: ATTENDANCE, requestKey: KEY });
  for (const route of ['/crm/leads/3', '/people/42', '/instructor', '/today']) assert.ok(revalidated.includes(route));
  revalidated.length = 0;
  hubReply = { ...hubReply, trialId: '8' };
  await post({ operation: 'record_trial_outcome', payload: ATTENDANCE, requestKey: KEY }, cookie);
  assert.equal(revalidated.length, 0);
});
test('trial attendance rejects alternate outcomes, scope overrides, invalid versions and missing auth/key', async () => {
  for (const bad of [{ ...ATTENDANCE, outcome: 'no_show' }, { ...ATTENDANCE, siteId: '99' }, { ...ATTENDANCE, memberId: '42' }, { ...ATTENDANCE, expectedVersion: -1 }, { ...ATTENDANCE, reason: '' }]) {
    assert.equal((await post({ operation: 'record_trial_outcome', payload: bad, requestKey: KEY }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'record_trial_outcome', payload: ATTENDANCE, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: 'record_trial_outcome', payload: ATTENDANCE, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
});

test('intake reads forward only exact scope-free unkeyed payloads', async () => {
  for (const [operation, payload] of [['intake_context', { query: '' }], ['intake_preview', { intake: INTAKE }]]) {
    assert.equal((await post({ operation, payload, requestKey: null }, cookie)).status, 200);
    assert.deepEqual(hubCalls.at(-1), { siteId: '1', operation, payload, requestKey: null });
    const count = hubCalls.length;
    assert.equal((await post({ operation, payload: { ...payload, siteId: '99' }, requestKey: null }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: null })).status, 401);
    assert.equal(hubCalls.length, count);
  }
});
test('create_student forwards reviewed profile only, preserves key and revalidates confirmed identity', async () => {
  const payload = { intake: INTAKE, reviewToken: 'a'.repeat(64) };
  hubReply = { state: 'student_created', memberId: '42', memberNumber: 'S42', guardianId: null, householdId: null, reviewRef: INTAKE.reviewRef, subscriptionCreated: false, enrollmentCreated: false, portalAccessGranted: false, messageSent: false, replayed: false };
  await post({ operation: 'create_student', payload, requestKey: KEY }, cookie);
  assert.deepEqual(hubCalls[0], { siteId: '1', operation: 'create_student', payload, requestKey: KEY });
  assert.ok(revalidated.includes('/people')); assert.ok(revalidated.includes('/people/42'));
  assert.equal(revalidated.some(r => r.startsWith('/crm/leads/')), false);
  revalidated.length = 0;
  hubReply = { ...hubReply, reviewRef: 'Different request' };
  await post({ operation: 'create_student', payload, requestKey: KEY }, cookie);
  assert.equal(revalidated.length, 0);
});
test('student creation rejects scope, membership, lead overrides and missing review/key before Odoo', async () => {
  const payload = { intake: INTAKE, reviewToken: 'a'.repeat(64) };
  for (const bad of [{ ...payload, leadId: '3' }, { ...payload, siteId: '99' }, { ...payload, reviewToken: '' }, { ...payload, intake: { ...INTAKE, membership_state: 'active' } }]) {
    assert.equal((await post({ operation: 'create_student', payload: bad, requestKey: KEY }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'create_student', payload, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: 'create_student', payload, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
});

const LEAD_EDIT = { leadId: '42', expectedVersion: 456, changes: { name: 'Updated lead' } };
const TRIAL_RESERVATION = { leadId: '3', expectedLeadVersion: 10, memberId: '42', sessionId: '101', expectedSessionVersion: 20, reason: 'Reviewed trial booking' };
test('trial_context is an exact unkeyed read with no client-supplied scope', async () => {
  const payload = { leadId: '3', query: 'Trial' };
  assert.equal((await post({ operation: 'trial_context', payload, requestKey: null }, cookie)).status, 200);
  assert.deepEqual(hubCalls, [{ siteId: '1', operation: 'trial_context', payload, requestKey: null }]);
  hubCalls.length = 0;
  for (const bad of [{ ...payload, siteId: '99' }, { ...payload, query: 'x'.repeat(101) }, { query: 'Trial' }]) {
    assert.equal((await post({ operation: 'trial_context', payload: bad, requestKey: null }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'trial_context', payload, requestKey: KEY }, cookie)).status, 400);
  assert.equal(hubCalls.length, 0);
});

test('reserve_trial forwards exact versions/identity and invalidates only a matching authoritative receipt', async () => {
  hubReply = { trialId: '7', leadId: '3', memberId: '42', sessionId: '101', enrollmentId: '8', state: 'trial_reserved',
    reason: TRIAL_RESERVATION.reason, stageChanged: false, messageSent: false, membershipCreated: false, replayed: false };
  assert.equal((await post({ operation: 'reserve_trial', payload: TRIAL_RESERVATION, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls[0], { siteId: '1', operation: 'reserve_trial', payload: TRIAL_RESERVATION, requestKey: KEY });
  for (const route of ['/crm/leads/3', '/people/42', '/instructor', '/today']) assert.ok(revalidated.includes(route));
  revalidated.length = 0;
  hubReply = { ...hubReply, sessionId: '102' };
  await post({ operation: 'reserve_trial', payload: TRIAL_RESERVATION, requestKey: KEY }, cookie);
  assert.equal(revalidated.length, 0);
});

test('reserve_trial rejects missing keys, scope overrides and wrong payloads before Odoo', async () => {
  for (const bad of [{ ...TRIAL_RESERVATION, siteId: '99' }, { ...TRIAL_RESERVATION, memberId: null },
    { ...TRIAL_RESERVATION, expectedSessionVersion: -1 }, { ...TRIAL_RESERVATION, reason: '' }]) {
    assert.equal((await post({ operation: 'reserve_trial', payload: bad, requestKey: KEY }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'reserve_trial', payload: TRIAL_RESERVATION, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: 'reserve_trial', payload: TRIAL_RESERVATION, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
});
test('assignment diagnostics identify app-origin rejection versus an authoritative Odoo refusal', async () => {
  const payload = { leadId: '42', expectedVersion: 456, ownerId: '7' };
  const wrongOrigin = await hubRoute(new Request(`${ORIGIN}/api/hub`, { method: 'POST', headers: { origin: 'http://127.0.0.1:3000', cookie, 'content-type': 'application/json' }, body: JSON.stringify({ operation: 'assign_lead', payload, requestKey: KEY }) }));
  assert.equal(wrongOrigin.headers.get('x-dojang-hub-error-stage'), 'origin');
  assert.equal(hubCalls.length, 0);
  hubReply = { error: { code: 'FORBIDDEN', status: 403 } };
  const denied = await post({ operation: 'assign_lead', payload, requestKey: KEY }, cookie);
  assert.equal(denied.headers.get('x-dojang-hub-error-stage'), 'backend');
  assert.equal(await errorOf(denied), 'FORBIDDEN');
});
test('assign_lead forwards exact identity/version and invalidates only matching confirmed assignments', async () => {
  const payload = { leadId: '42', expectedVersion: 456, ownerId: '7' };
  hubReply = { leadId: '42', ownerId: '7', state: 'assigned', replayed: false };
  assert.equal((await post({ operation: 'assign_lead', payload, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls, [{ siteId: '1', operation: 'assign_lead', payload, requestKey: KEY }]);
  assert.ok(revalidated.includes('/crm/leads/42'));
  revalidated.length = 0;
  hubReply = { leadId: '42', ownerId: '8', state: 'assigned', replayed: false };
  await post({ operation: 'assign_lead', payload, requestKey: KEY }, cookie);
  assert.equal(revalidated.length, 0);
});

test('assign_lead rejects scope injection, clearing the owner, absent request keys and invalid staff sessions', async () => {
  const payload = { leadId: '42', expectedVersion: 456, ownerId: '7' };
  for (const bad of [{ ...payload, ownerId: null }, { ...payload, expectedVersion: -1 }, { ...payload, siteId: '99' }]) {
    assert.equal((await post({ operation: 'assign_lead', payload: bad, requestKey: KEY }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'assign_lead', payload, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: 'assign_lead', payload, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
});
test('update_lead forwards a narrow versioned edit and revalidates only after an identity-checked receipt', async () => {
  hubReply = { leadId: '42', version: 457, replayed: false };
  const response = await post({ operation: 'update_lead', payload: LEAD_EDIT, requestKey: KEY }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls, [{ siteId: '1', operation: 'update_lead', payload: LEAD_EDIT, requestKey: KEY }]);
  assert.ok(revalidated.includes('/crm/leads/42'));
  assert.ok(revalidated.includes('/crm'));
  revalidated.length = 0;
  hubReply = { leadId: '43', version: 457, replayed: false };
  await post({ operation: 'update_lead', payload: LEAD_EDIT, requestKey: KEY }, cookie);
  assert.equal(revalidated.length, 0);
});

test('update_lead refuses injected scope, unsupported field edits, missing keys and forged sessions', async () => {
  for (const payload of [{ ...LEAD_EDIT, siteId: '99' }, { ...LEAD_EDIT, changes: { ownerId: '7' } },
    { ...LEAD_EDIT, changes: { stageId: '7' } }, { ...LEAD_EDIT, changes: {} }, { ...LEAD_EDIT, changes: { email: 'bad' } }]) {
    assert.equal((await post({ operation: 'update_lead', payload, requestKey: KEY }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'update_lead', payload: LEAD_EDIT, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: 'update_lead', payload: LEAD_EDIT, requestKey: KEY }, 'dojang_hub_session=forged')).status, 401);
  assert.equal(hubCalls.length, 0);
});

test('ai_settings forwards only an empty read and never invalidates records', async () => {
  const response = await post({ operation: 'ai_settings', payload: {}, requestKey: null }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls, [{ siteId: '1', operation: 'ai_settings', payload: {}, requestKey: null }]);
  assert.deepEqual(revalidated, []);
});

test('ai_settings rejects browser scope, write keys, and missing authentication', async () => {
  for (const payload of [{ siteId: '99' }, { role: 'owner' }, { enabled: true }]) {
    assert.equal((await post({ operation: 'ai_settings', payload, requestKey: null }, cookie)).status, 400);
  }
  assert.equal((await post({ operation: 'ai_settings', payload: {}, requestKey: KEY }, cookie)).status, 400);
  assert.equal((await post({ operation: 'ai_settings', payload: {}, requestKey: null })).status, 401);
  assert.equal(hubCalls.length, 0);
});

test('AI configuration read does not enable AI activation writes', async () => {
  assert.equal((await post({ operation: 'enable_ai', payload: { expectedSiteVersion: 1, expectedConfigVersion: 1 }, requestKey: KEY }, cookie)).status, 403);
  assert.equal(hubCalls.length, 0);
});

test("prepare_lead_action with a valid payload and request key is forwarded as is", async () => {
  const response = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY }, cookie);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.taskId, "501");
  assert.equal(body.messageSent, false);
  assert.equal(hubCalls.length, 1);
  assert.deepEqual(hubCalls[0], { siteId: "1", operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY });
});

test("the same request key is passed through unchanged on a retry", async () => {
  await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY }, cookie);
  await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY }, cookie);
  assert.deepEqual(hubCalls.map((call) => call.requestKey), [KEY, KEY]);
});

test("prepare_lead_action without a request key is refused before Odoo", async () => {
  const response = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: null }, cookie);
  assert.equal(response.status, 400);
  assert.equal(await errorOf(response), "INVALID_COMMAND");
  const short = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: "short" }, cookie);
  assert.equal(short.status, 400);
  assert.equal(hubCalls.length, 0);
});

test("an extra payload key is refused before Odoo", async () => {
  const response = await post(
    { operation: "prepare_lead_action", payload: { ...PAYLOAD, ownerId: "3" }, requestKey: KEY },
    cookie,
  );
  assert.equal(response.status, 400);
  assert.equal(hubCalls.length, 0);
});

test("a kind other than follow_up is refused before Odoo", async () => {
  for (const kind of ["trial", "reactivation", "conversion"]) {
    const response = await post({ operation: "prepare_lead_action", payload: { ...PAYLOAD, kind }, requestKey: KEY }, cookie);
    assert.equal(response.status, 400);
  }
  assert.equal(hubCalls.length, 0);
});

test("malformed fields are refused before Odoo", async () => {
  const bad = [
    { ...PAYLOAD, leadId: "abc" },
    { ...PAYLOAD, expectedVersion: "1" },
    { ...PAYLOAD, reason: "   " },
    { ...PAYLOAD, reason: "x".repeat(801) },
    { ...PAYLOAD, due: "tomorrow" },
  ];
  for (const payload of bad) {
    const response = await post({ operation: "prepare_lead_action", payload, requestKey: KEY }, cookie);
    assert.equal(response.status, 400);
  }
  assert.equal(hubCalls.length, 0);
});

test("other writes stay refused with HUB_READ_ONLY", async () => {
  const writes = {
    cancel_trial: { trialId: '1', expectedVersion: 1, reason: 'x' },
    create_broadcast: { title: "x" },
  };
  for (const [operation, payload] of Object.entries(writes)) {
    const response = await post({ operation, payload, requestKey: KEY }, cookie);
    assert.equal(response.status, 403, operation);
    assert.equal(await errorOf(response), "HUB_READ_ONLY", operation);
  }
  assert.equal(hubCalls.length, 0);
});

const INTERNAL_WRITES = {
  complete_task: { taskId: "501", expectedVersion: 1729000000000000, feedback: "Spoke with guardian." },
  add_lead_note: { leadId: "9008", expectedVersion: 1729000000000000, note: "Prefers afternoon sessions." },
};
test("internal write errors and unreadable receipts do not invalidate records", async () => {
  for (const operation of Object.keys(INTERNAL_WRITES)) {
    const payload = INTERNAL_WRITES[operation];
    for (const code of ["VERSION_CONFLICT", "FORBIDDEN", "SIGN_IN_REQUIRED"]) {
      hubReply = { error: { code, status: code === "VERSION_CONFLICT" ? 409 : code === "FORBIDDEN" ? 403 : 401 } };
      assert.equal(await errorOf(await post({ operation, payload, requestKey: KEY }, cookie)), code);
    }
    hubReply = { state: "done" };
    assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 200);
  }
  assert.equal(revalidated.length, 0);
});
test("confirmed member task completion invalidates its member and task queue", async () => {
  hubReply = { taskId: "501", memberId: "42", state: "done", replayed: true };
  assert.equal((await post({ operation: "complete_task", payload: INTERNAL_WRITES.complete_task, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(revalidated, ["/crm", "/crm/follow-ups", "/front-desk", "/people/42"]);
});
for (const [operation, payload] of Object.entries(INTERNAL_WRITES)) {
  test(`${operation} forwards exact version, payload, configured site and same retry key`, async () => {
    for (let attempt = 0; attempt < 2; attempt++) assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 200);
    assert.deepEqual(hubCalls, [0, 1].map(() => ({ siteId: "1", operation, payload, requestKey: KEY })));
    assert.deepEqual(revalidated, [0, 1].flatMap(() => ["/crm", "/crm/follow-ups", "/front-desk", "/crm/leads/9008"]));
  });
  test(`${operation} rejects invalid payloads, keys, sessions and actor overrides`, async () => {
    const textKey = operation === "complete_task" ? "feedback" : "note";
    const max = operation === "complete_task" ? 1000 : 2000;
    for (const bad of [
      { ...payload, expectedVersion: "1" }, { ...payload, expectedVersion: -1 },
      { ...payload, expectedVersion: 1.5 }, { ...payload, expectedVersion: Number.MAX_SAFE_INTEGER + 1 },
      { ...payload, [textKey]: " " }, { ...payload, [textKey]: "x".repeat(max + 1) },
      { ...payload, siteId: "99" }, { ...payload, actorId: "99" },
    ]) assert.equal((await post({ operation, payload: bad, requestKey: KEY }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: null }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: KEY })).status, 401);
    assert.equal((await post({ operation, payload, requestKey: KEY }, "dojang_hub_session=forged")).status, 401);
    assert.equal(hubCalls.length, 0);
    assert.equal(revalidated.length, 0);
  });
}

const INBOX_WRITES = {
  resolve: { messageId: "301", memberId: "5001", sessionId: "6101", expectedRevision: 0 },
  draft: { messageId: "301", expectedRevision: 1 },
  approve_reply: { messageId: "301", expectedRevision: 2, reply: "We'll confirm a makeup class with you." },
};
for (const [operation, payload] of Object.entries(INBOX_WRITES)) {
  test(`inbox ${operation} forwards its exact payload with the same retry key`, async () => {
    hubReply = { messageId: "301", revision: 2, deliveryId: "77", state: "queued", replayed: false };
    for (let attempt = 0; attempt < 2; attempt++) assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 200);
    assert.deepEqual(hubCalls, [0, 1].map(() => ({ siteId: "1", operation, payload, requestKey: KEY })));
  });
  test(`inbox ${operation} rejects bad payloads, overrides, missing keys and sessions before Odoo`, async () => {
    for (const bad of [
      { ...payload, messageId: "0" }, { ...payload, messageId: 301 }, { ...payload, expectedRevision: -1 },
      { ...payload, expectedRevision: "1" }, { ...payload, siteId: "99" }, { ...payload, channel: "sms" },
      ...(operation === "approve_reply" ? [{ ...payload, reply: " " }, { ...payload, reply: "x".repeat(1501) }] : []),
      ...(operation === "resolve" ? [{ ...payload, memberId: "abc" }] : []),
    ]) assert.equal((await post({ operation, payload: bad, requestKey: KEY }, cookie)).status, 400, JSON.stringify(bad));
    assert.equal((await post({ operation, payload, requestKey: null }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: KEY })).status, 401);
    assert.equal(hubCalls.length, 0);
  });
}

const CLASS_MOVE = { memberId: "3", sessionId: "118", fromSessionId: "117", expectedVersion: 1730000000000 };
const MOVE_TASK = { relatedType: "member", relatedId: "3", summary: "Confirm attendance after a class move", due: "2026-11-03" };
test("change_class and create_task forward their exact payloads and invalidate the member", async () => {
  hubReply = { memberId: "3", sessionId: "118", enrollmentId: "900", state: "registered", replayed: false };
  assert.equal((await post({ operation: "change_class", payload: CLASS_MOVE, requestKey: KEY }, cookie)).status, 200);
  hubReply = { taskId: "77", memberId: "3", replayed: false };
  assert.equal((await post({ operation: "create_task", payload: MOVE_TASK, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls, [
    { siteId: "1", operation: "change_class", payload: CLASS_MOVE, requestKey: KEY },
    { siteId: "1", operation: "create_task", payload: MOVE_TASK, requestKey: KEY },
  ]);
  assert.deepEqual(revalidated, [0, 1].flatMap(() => ["/crm", "/crm/follow-ups", "/front-desk", "/people/3"]));
});
test("change_class and create_task reject bad payloads and overrides before Odoo", async () => {
  for (const bad of [
    { ...CLASS_MOVE, sessionId: "117" }, { ...CLASS_MOVE, expectedVersion: "1" }, { ...CLASS_MOVE, memberId: 3 },
    { ...CLASS_MOVE, siteId: "9" }, { memberId: "3", sessionId: "118", expectedVersion: 1 },
  ]) assert.equal((await post({ operation: "change_class", payload: bad, requestKey: KEY }, cookie)).status, 400, JSON.stringify(bad));
  for (const bad of [
    { ...MOVE_TASK, relatedType: "partner" }, { ...MOVE_TASK, summary: " " }, { ...MOVE_TASK, summary: "x".repeat(201) },
    { ...MOVE_TASK, due: "Nov 3" }, { ...MOVE_TASK, userId: "7" },
  ]) assert.equal((await post({ operation: "create_task", payload: bad, requestKey: KEY }, cookie)).status, 400, JSON.stringify(bad));
  assert.equal((await post({ operation: "change_class", payload: CLASS_MOVE, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: "create_task", payload: MOVE_TASK, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
});

const NEW_LEAD = { name: "Maya Chen - kids karate", contact: "Ana Chen", email: "ana@example.invalid", phone: "+1 555 0100" };
test("create_lead forwards exactly the four fields with the same retry key and invalidates the new lead", async () => {
  for (let attempt = 0; attempt < 2; attempt++) assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls, [0, 1].map(() => ({ siteId: "1", operation: "create_lead", payload: NEW_LEAD, requestKey: KEY })));
  assert.deepEqual(revalidated, [0, 1].flatMap(() => ["/crm", "/crm/follow-ups", "/front-desk", "/crm/leads/9100"]));
});
test("create_lead rejects bad fields, stage or owner overrides, missing keys and sessions before Odoo", async () => {
  const { phone, ...missingPhone } = NEW_LEAD;
  for (const bad of [
    { ...NEW_LEAD, name: " " }, { ...NEW_LEAD, name: "x".repeat(201) }, { ...NEW_LEAD, email: "not-an-email" },
    { ...NEW_LEAD, phone: 5550100 }, missingPhone, { ...NEW_LEAD, stageId: "4" }, { ...NEW_LEAD, userId: "7" },
    { ...NEW_LEAD, siteId: "99" },
  ]) assert.equal((await post({ operation: "create_lead", payload: bad, requestKey: KEY }, cookie)).status, 400);
  assert.equal(phone.length > 0, true);
  assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
  hubReply = { leadId: "not-an-id", version: 1, replayed: false };
  assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: KEY }, cookie)).status, 200);
  assert.equal(revalidated.length, 0); // an unreadable receipt invalidates nothing
});

test("existing reads still go through with a null request key", async () => {
  const response = await post({ operation: "crm_context", payload: { query: "" }, requestKey: null }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls[0], { siteId: "1", operation: "crm_context", payload: { query: "" }, requestKey: null });
  const keyed = await post({ operation: "context", payload: {}, requestKey: KEY }, cookie);
  assert.equal(keyed.status, 400); // reads never carry a request key
});

// A Perspective is presentation only (src/domain/perspective.ts): it can never
// ride along to Odoo as an extra field, on a read or a write
test("a perspective sent with a request is refused before Odoo", async () => {
  const read = await post({ operation: "context", payload: {}, requestKey: null, perspective: "executive" }, cookie);
  assert.equal(read.status, 400);
  const write = await post(
    { operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY, perspective: "frontDesk" },
    cookie,
  );
  assert.equal(write.status, 400);
  assert.equal(hubCalls.length, 0);
});

test("an action without a sign-in is refused", async () => {
  const response = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY });
  assert.equal(response.status, 401);
  assert.equal(hubCalls.length, 0);
});

test("companion_ask forwards exactly the verified read with null request key", async () => {
  const payload = { question: "Summarize this member.", memberId: "5001", sessionId: null };
  const response = await post({ operation: "companion_ask", payload, requestKey: null }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls, [{ siteId: "1", operation: "companion_ask", payload, requestKey: null }]);
});

test("companion_ask rejects malformed payloads and keyed reads before Odoo", async () => {
  const valid = { question: "Question", memberId: null, sessionId: null };
  for (const payload of [
    { ...valid, leadId: "9" }, { question: "Question" },
    { ...valid, question: " " }, { ...valid, question: " padded " },
    { ...valid, question: "x".repeat(501) }, { ...valid, question: 5 },
    { ...valid, memberId: "not-an-id" }, { ...valid, memberId: 5001 },
    { ...valid, memberId: "5001", sessionId: "6101" },
    { ...valid, sessionId: "0" }, { ...valid, memberId: "1", siteId: "2" },
  ]) {
    const response = await post({ operation: "companion_ask", payload, requestKey: null }, cookie);
    assert.equal(response.status, 400, JSON.stringify(payload));
  }
  assert.equal((await post({ operation: "companion_ask", payload: valid, requestKey: KEY }, cookie)).status, 400);
  assert.equal(hubCalls.length, 0);
});

test("companion_ask still requires a valid sealed staff session", async () => {
  const body = { operation: "companion_ask", payload: { question: "Hi", memberId: null, sessionId: null }, requestKey: null };
  assert.equal((await post(body)).status, 401);
  assert.equal((await post(body, "dojang_hub_session=forged")).status, 401);
  assert.equal(hubCalls.length, 0);
});
