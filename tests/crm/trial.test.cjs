const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_CRM_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(build, request.slice(2));
  return resolve.call(this, request, ...rest);
};
const { trialContextFrom, isReserveTrialPayload, isReservedTrialResult } = require(path.join(build, 'domain/trial.js'));
const { getTrialContext } = require(path.join(build, 'integrations/trial.js'));
const { reserveTrial } = require(path.join(build, 'integrations/crmWrites.js'));
const { isTrialAttendancePayload, isTrialAttendanceResult } = require(path.join(build, 'domain/trial.js'));
const { recordTrialAttendance } = require(path.join(build, 'integrations/crmWrites.js'));
const context = () => ({ lead: { id: '3', name: 'Lead', version: 10, stage: 'New', contact: null },
  students: [{ id: '42', name: 'Trial student', memberNumber: 'S42', state: 'lead' }],
  sessions: [{ id: '101', title: 'Beginner class', startsAt: '2026-11-10T18:00:00Z', version: 20, registered: 1, capacity: 10, courseRoster: false }],
  trials: [], stageAutomations: [] });
const payload = { leadId: '3', expectedLeadVersion: 10, memberId: '42', sessionId: '101', expectedSessionVersion: 20, reason: 'Reviewed trial booking' };
const key = 'trial-request-key-00001';
const attendancePayload = { trialId: '7', expectedVersion: 30, outcome: 'attended', reason: 'Staff observed student in this class' };
const bookedTrial = { id: '7', version: 30, state: 'reserved', member: { id: '42', name: 'Student' }, session: { id: '101', title: 'Class', startsAt: '2026-11-03T23:30:00Z', canRecordOutcome: true } };
const attendanceReceipt = () => ({ trialId: '7', leadId: '3', memberId: '42', sessionId: '101', attendanceId: '90', state: 'trial_attended', reason: attendancePayload.reason, stageChanged: false, messageSent: false, noShowFollowUpScheduled: false, replayed: false });

test('attendance availability is taken from the server, with unsupported distinct from false', () => {
  const raw = { ...context(), trials: [bookedTrial] };
  assert.equal(trialContextFrom(raw, '3').trials[0].session.canRecordOutcome, true);
  raw.trials[0] = { ...bookedTrial, session: { ...bookedTrial.session, canRecordOutcome: false } };
  assert.equal(trialContextFrom(raw, '3').trials[0].session.canRecordOutcome, false);
  delete raw.trials[0].session.canRecordOutcome;
  assert.equal(trialContextFrom(raw, '3').trials[0].session.canRecordOutcome, null);
  raw.trials[0].session.canRecordOutcome = 'true';
  assert.equal(trialContextFrom(raw, '3'), null);
});

test('attendance allows only reviewed attended outcome, trial version and reason', () => {
  assert.ok(isTrialAttendancePayload(attendancePayload));
  for (const bad of [{ ...attendancePayload, outcome: 'no_show' }, { ...attendancePayload, expectedVersion: -1 }, { ...attendancePayload, reason: '' }, { ...attendancePayload, memberId: '42' }, { ...attendancePayload, siteId: '99' }]) assert.equal(isTrialAttendancePayload(bad), false);
});

test('attendance receipts must match trial, lead, student, class, outcome and unchanged effects', () => {
  assert.ok(isTrialAttendanceResult(attendanceReceipt(), attendancePayload, '3', bookedTrial));
  for (const field of ['trialId', 'leadId', 'memberId', 'sessionId']) assert.equal(isTrialAttendanceResult({ ...attendanceReceipt(), [field]: '99' }, attendancePayload, '3', bookedTrial), false);
  for (const field of ['stageChanged', 'messageSent', 'noShowFollowUpScheduled']) assert.equal(isTrialAttendanceResult({ ...attendanceReceipt(), [field]: true }, attendancePayload, '3', bookedTrial), false);
  assert.equal(isTrialAttendanceResult({ ...attendanceReceipt(), state: 'trial_no_show' }, attendancePayload, '3', bookedTrial), false);
});

test('attendance uncertain retry preserves original request and checks the full returned identity', async () => {
  const calls = [];
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); if (calls.length === 1) throw Error('lost response'); return Response.json({ ...attendanceReceipt(), replayed: true }); };
  assert.equal((await recordTrialAttendance(attendancePayload, '3', bookedTrial, key)).outcome, 'notConfirmed');
  assert.equal((await recordTrialAttendance(attendancePayload, '3', bookedTrial, key)).result.replayed, true);
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls[0].operation, 'record_trial_outcome');
  global.fetch = async () => Response.json({ ...attendanceReceipt(), memberId: '99' });
  assert.equal((await recordTrialAttendance(attendancePayload, '3', bookedTrial, key)).outcome, 'notConfirmed');
  for (const code of ['ATTENDANCE_WINDOW_CLOSED', 'ATTENDANCE_REVIEW_REQUIRED', 'VERSION_CONFLICT', 'FORBIDDEN', 'SIGN_IN_REQUIRED']) {
    global.fetch = async () => Response.json({ error: { code } }, { status: 409 });
    assert.deepEqual(await recordTrialAttendance(attendancePayload, '3', bookedTrial, key), { outcome: 'failed', code });
  }
});
const receipt = () => ({ trialId: '7', leadId: '3', memberId: '42', sessionId: '101', enrollmentId: '8', state: 'trial_reserved',
  reason: payload.reason, stageChanged: false, messageSent: false, membershipCreated: false, replayed: false });

test('trial context validates requested identity and projects only reservation fields', () => {
  const raw = context();
  raw.students[0].medical = 'private'; raw.plans = [{ price: 99 }];
  const parsed = trialContextFrom(raw, '3');
  assert.ok(parsed);
  assert.equal('medical' in parsed.students[0], false);
  assert.equal('plans' in parsed, false);
  assert.equal(trialContextFrom(raw, '4'), null);
  assert.equal(trialContextFrom({ ...raw, students: [...raw.students, ...raw.students] }, '3'), null);
  assert.equal(trialContextFrom({ ...raw, sessions: [{ ...raw.sessions[0], capacity: '10' }] }, '3'), null);
  assert.equal(trialContextFrom({ ...raw, trials: undefined }, '3'), null);
});

test('empty results and unavailable automation context remain distinct from malformed results', () => {
  const raw = context(); raw.students = []; raw.sessions = []; delete raw.stageAutomations;
  const parsed = trialContextFrom(raw, '3');
  assert.deepEqual(parsed.students, []); assert.deepEqual(parsed.sessions, []); assert.equal(parsed.stageAutomations, null);
  assert.equal(trialContextFrom({ ...raw, sessions: null }, '3'), null);
});

test('reservation payload accepts exact versioned IDs and rejects authority, stage and missing data', () => {
  assert.equal(isReserveTrialPayload(payload), true);
  for (const bad of [{ ...payload, siteId: '99' }, { ...payload, stageId: '9' }, { ...payload, memberId: '0' },
    { ...payload, memberId: 42 }, { ...payload, expectedLeadVersion: -1 }, { ...payload, reason: ' ' },
    { ...payload, expectedSessionVersion: undefined }]) assert.equal(isReserveTrialPayload(bad), false);
});

test('successful receipt requires all record identities and explicit no-stage/no-message/no-membership effects', () => {
  assert.equal(isReservedTrialResult(receipt(), payload), true);
  for (const changes of [{ leadId: '4' }, { memberId: '43' }, { sessionId: '102' }, { trialId: '' },
    { enrollmentId: '0' }, { state: 'queued' }, { messageSent: true }, { stageChanged: true },
    { membershipCreated: true }, { paymentCollected: true }, { replayed: undefined }]) {
    assert.equal(isReservedTrialResult({ ...receipt(), ...changes }, payload), false);
  }
});

test('student search uses the exact Hub read and failures never return fixtures', async () => {
  let request;
  global.fetch = async (url, init) => { request = JSON.parse(init.body); return Response.json(context()); };
  assert.equal((await getTrialContext('3', ' Trial ')).outcome, 'loaded');
  assert.deepEqual(request, { operation: 'trial_context', payload: { leadId: '3', query: 'Trial' }, requestKey: null });
  for (const code of ['FORBIDDEN', 'SIGN_IN_REQUIRED', 'BACKEND_UNAVAILABLE']) {
    global.fetch = async () => Response.json({ error: { code } }, { status: 403 });
    const answer = await getTrialContext('3', 'Trial');
    assert.equal(answer.outcome, 'unavailable'); assert.equal(answer.code, code); assert.equal(answer.context, undefined);
  }
  global.fetch = async () => Response.json({ ...context(), lead: { ...context().lead, id: '4' } });
  assert.equal((await getTrialContext('3', '')).code, 'HUB_RESPONSE_UNREADABLE');
});

test('reservation retry preserves the exact request key and payload; malformed receipts are uncertain', async () => {
  const calls = [];
  global.fetch = async (url, init) => { calls.push(JSON.parse(init.body)); throw new Error('lost response'); };
  assert.equal((await reserveTrial(payload, key)).outcome, 'notConfirmed');
  global.fetch = async (url, init) => { calls.push(JSON.parse(init.body)); return Response.json({ ...receipt(), replayed: true }); };
  assert.equal((await reserveTrial(payload, key)).result.replayed, true);
  assert.deepEqual(calls[0], calls[1]);
  global.fetch = async () => Response.json({ ...receipt(), memberId: '43' });
  assert.equal((await reserveTrial(payload, key)).outcome, 'notConfirmed');
});

test('reservation preserves duplicate, stale-version, scope and business-rule rejections', async () => {
  for (const code of ['TRIAL_ALREADY_OPEN', 'VERSION_CONFLICT', 'FORBIDDEN', 'BUSINESS_RULE_REVIEW_REQUIRED', 'TRIAL_STUDENT_REVIEW_REQUIRED']) {
    global.fetch = async () => Response.json({ error: { code } }, { status: 409 });
    assert.deepEqual(await reserveTrial(payload, key), { outcome: 'failed', code });
  }
});
