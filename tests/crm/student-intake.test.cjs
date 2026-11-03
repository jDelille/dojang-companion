const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_CRM_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) { return resolve.call(this, request.startsWith('@/') ? path.join(build, request.slice(2)) : request, ...rest); };
const { isIntake, isCreateStudentPayload, intakeContextFrom, intakePreviewFrom, isStudentReceipt } = require(path.join(build, 'domain/studentIntake.js'));
const { getIntakeContext, previewStudent } = require(path.join(build, 'integrations/studentIntake.js'));
const { createStudent } = require(path.join(build, 'integrations/crmWrites.js'));
const intake = () => ({ studentType: 'adult', student: { name: 'Prospect', email: 'p@example.invalid', phone: '', dateOfBirth: '2000-01-01', gender: '' }, guardian: null, reviewRef: 'Staff verified identity' });
const guardian = { id: '7', name: 'Guardian', householdId: '8', household: 'Family', version: 12, householdVersion: 13 };
const payload = () => ({ intake: intake(), reviewToken: 'a'.repeat(64) });
const receipt = () => ({ state: 'student_created', memberId: '42', memberNumber: 'S42', guardianId: null, householdId: null, reviewRef: intake().reviewRef, subscriptionCreated: false, enrollmentCreated: false, portalAccessGranted: false, messageSent: false, replayed: false });
const key = 'intake-request-key-0001';

test('intake accepts only named profile fields and explicit adult/child guardian relationships', () => {
  assert.ok(isIntake(intake()));
  for (const extra of ['leadId', 'membership_state', 'siteId', 'subscriptionId']) assert.equal(isIntake({ ...intake(), [extra]: '3' }), false);
  assert.equal(isIntake({ ...intake(), student: { ...intake().student, dateOfBirth: '2000-02-30' } }), false);
  assert.equal(isIntake({ ...intake(), student: { ...intake().student, gender: ['male'] } }), false);
  assert.equal(isIntake({ ...intake(), guardian: { kind: 'new', name: 'Wrong', email: '', phone: '' } }), false);
  const child = { ...intake(), studentType: 'child', guardian: { kind: 'existing', partnerId: '7', householdId: '8', expectedVersion: 12, expectedHouseholdVersion: 13 } };
  assert.ok(isIntake(child));
  assert.equal(isIntake({ ...child, guardian: { ...child.guardian, expectedVersion: -1 } }), false);
  assert.equal(isCreateStudentPayload({ ...payload(), reviewToken: '' }), false);
});

test('intake context distinguishes confirmed empty from malformed and discards unneeded fields', () => {
  const raw = { guardians: [guardian], moreGuardians: false, school: 'School', today: '2026-11-03', recent: [{ name: 'Not needed' }] };
  const parsed = intakeContextFrom(raw);
  assert.equal(parsed.guardians[0].id, '7'); assert.equal('recent' in parsed, false);
  assert.ok(intakeContextFrom({ ...raw, guardians: [] }));
  for (const guardians of [undefined, [guardian, guardian], [{ ...guardian, householdVersion: '13' }]]) assert.equal(intakeContextFrom({ ...raw, guardians }), null);
});

test('preview requires reviewed profile-only effects and preserves duplicate review without guessing', () => {
  const raw = { valid: true, ...payload(), guardianName: null, householdName: null, state: 'profile_only', subscriptionCreated: false, enrollmentCreated: false, portalAccessGranted: false, messageSent: false };
  assert.ok(intakePreviewFrom(raw));
  assert.equal(intakePreviewFrom({ ...raw, enrollmentCreated: true }), null);
  const duplicate = { valid: false, code: 'DUPLICATE_STUDENT_REVIEW_REQUIRED', issues: [{ field: 'student.name', message: 'Review existing profile' }], duplicateStudents: [{ memberId: '42', name: 'Prospect', memberNumber: 'S42', active: true }], guardianMatches: [guardian], unselectableGuardianMatch: false };
  assert.equal(intakePreviewFrom(duplicate).duplicateStudents[0].memberId, '42');
  assert.equal(intakePreviewFrom({ ...duplicate, guardianMatches: [{}] }), null);
  assert.equal(intakePreviewFrom({ ...duplicate, guardianMatches: null }), null);
  assert.equal(intakePreviewFrom({ valid: false }), null);
});

test('creation receipt binds review reference, explicit effects, and existing guardian/household IDs', () => {
  assert.ok(isStudentReceipt(receipt(), payload()));
  for (const bad of [{ ...receipt(), reviewRef: 'other' }, { ...receipt(), subscriptionCreated: true }, { ...receipt(), guardianId: '7' }, { ...receipt(), memberId: '0' }]) assert.equal(isStudentReceipt(bad, payload()), false);
  const child = { ...payload(), intake: { ...intake(), studentType: 'child', guardian: { kind: 'existing', partnerId: '7', householdId: '8', expectedVersion: 12, expectedHouseholdVersion: 13 } } };
  assert.ok(isStudentReceipt({ ...receipt(), guardianId: '7', householdId: '8' }, child));
  assert.equal(isStudentReceipt({ ...receipt(), guardianId: '9', householdId: '8' }, child), false);
});

test('intake reads use exact unkeyed Hub contracts and never substitute fixtures', async () => {
  const calls = [];
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); return Response.json({ guardians: [], moreGuardians: false, school: 'School', today: '2026-11-03' }); };
  assert.equal((await getIntakeContext('  Family  ')).outcome, 'loaded');
  assert.deepEqual(calls[0], { operation: 'intake_context', payload: { query: 'Family' }, requestKey: null });
  global.fetch = async () => Response.json({ error: { code: 'SIGN_IN_REQUIRED' } }, { status: 401 });
  assert.deepEqual(await previewStudent(intake()), { outcome: 'unavailable', code: 'SIGN_IN_REQUIRED' });
  global.fetch = async () => Response.json({});
  assert.deepEqual(await getIntakeContext(''), { outcome: 'unavailable', code: 'HUB_RESPONSE_UNREADABLE' });
});

test('uncertain student creation reuses exact reviewed payload/key and validates committed results', async () => {
  const calls = [];
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); if (calls.length === 1) throw Error('lost response'); return Response.json({ ...receipt(), replayed: true }); };
  const p = payload();
  assert.equal((await createStudent(p, key)).outcome, 'notConfirmed');
  const replay = await createStudent(p, key);
  assert.equal(replay.outcome, 'done'); assert.equal(replay.result.replayed, true);
  assert.deepEqual(calls[0], calls[1]);
  global.fetch = async () => Response.json({ ...receipt(), messageSent: true });
  assert.equal((await createStudent(p, key)).outcome, 'notConfirmed');
  global.fetch = async () => Response.json({ error: { code: 'DUPLICATE_STUDENT_REVIEW_REQUIRED' } }, { status: 409 });
  assert.deepEqual(await createStudent(p, key), { outcome: 'failed', code: 'DUPLICATE_STUDENT_REVIEW_REQUIRED' });
});
