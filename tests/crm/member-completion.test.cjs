const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_CRM_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) { return resolve.call(this, request.startsWith('@/') ? path.join(build, request.slice(2)) : request, ...rest); };
const { memberPayloadAllowed, memberResultAllowed } = require(path.join(build, 'domain/memberActions.js'));
const { onboardingFrom, ledgerFrom } = require(path.join(build, 'domain/memberCompletion.js'));
const { testingCatalogFrom, memberTestFrom, promotionHistoryFrom } = require(path.join(build, 'domain/memberTesting.js'));
const { memberWrite, memberRead } = require(path.join(build, 'integrations/memberActions.js'));
const token = 'a'.repeat(64), key = 'member-completion-00001';
const cases = {
  request_refund: [{ memberId: '5', invoiceId: '9', reason: 'Customer request', reviewToken: token }, { memberId: '5', refundId: '8', state: 'refund_requested', amount: 50, currency: 'USD', moneyReturned: false, creditNotePosted: false }],
  approve_refund: [{ refundId: '8', expectedVersion: 1, reason: 'Owner approval' }, { memberId: '5', refundId: '8', state: 'refund_approved', creditNote: 'CN/1', next: 'awaiting_refund_payment', moneyReturned: false, creditNotePosted: true, version: 2 }],
  record_refund_payment: [{ refundId: '8', expectedVersion: 2, reason: 'Cash returned at desk' }, { memberId: '5', refundId: '8', state: 'refund_payment_recorded', moneyReturned: true, payment: 'PAY/1', journal: 'Cash', evidence: 'staff_recorded', version: 3 }],
  cancel_refund: [{ refundId: '8', expectedVersion: 1, reason: 'Request withdrawn' }, { memberId: '5', refundId: '8', state: 'refund_cancelled', moneyReturned: false, version: 2 }],
  save_testing_roster: [{ testId: null, expectedVersion: 0, name: 'Belt test', testDate: '2026-11-04', add: [{ memberId: '5', targetRankId: '2' }], removeRegistrationIds: [], reason: 'Assessment planned' }, { testId: '7', state: 'testing_roster_saved', reason: 'Assessment planned', added: ['10'], removedMembers: [], count: 1, version: 1 }],
  record_test_results: [{ testId: '7', expectedVersion: 1, results: [{ registrationId: '10', result: 'pass' }], reason: 'Instructor assessment passed' }, { testId: '7', state: 'test_results_saved', reason: 'Instructor assessment passed', changes: [{ registrationId: '10', before: 'pending', after: 'pass' }], version: 2 }],
  promote_test_results: [{ testId: '7', expectedVersion: 2, registrationIds: ['10'], reason: 'Award reviewed', reviewToken: token }, { testId: '7', state: 'promotions_awarded', reason: 'Award reviewed', promotions: [{ rankHistoryId: '20', memberId: '5', rank: 'Yellow' }], messageSent: false, invoiceCreated: false, version: 3 }],
  reverse_promotion: [{ rankHistoryId: '20', expectedVersion: 3, reason: 'Award corrected' }, { memberId: '5', rankHistoryId: '20', state: 'promotion_reversed', reason: 'Award corrected', before: 'Yellow', after: 'White', version: 4 }],
};
for (const [operation, [payload, receipt]] of Object.entries(cases)) test(`completion action ${operation} accepts only its existing contract and validates the committed receipt`, () => {
  assert.ok(memberPayloadAllowed(operation, payload));
  assert.equal(memberPayloadAllowed(operation, { ...payload, siteId: '99' }), false);
  assert.equal(memberPayloadAllowed(operation, { ...payload, actorId: '5' }), false);
  const command = { operation, payload, subjectId: '5' };
  assert.ok(memberResultAllowed(command, { ...receipt, replayed: false }));
  const wrong = operation === 'request_refund' || operation === 'reverse_promotion' ? { ...receipt, memberId: '6' } : operation.includes('refund') ? { ...receipt, refundId: '99' } : operation === 'save_testing_roster' ? { ...receipt, added: ['10', '11'] } : operation === 'record_test_results' ? { ...receipt, changes: [{ registrationId: '11', after: 'pass', before: 'pending' }] } : { ...receipt, promotions: [{ rankHistoryId: '20', memberId: '6', rank: 'Yellow' }] };
  assert.equal(memberResultAllowed(command, { ...wrong, replayed: false }), false);
});
test('credit notes, staff refund payments and provider confirmations are not interchangeable', () => {
  const c = { operation: 'approve_refund', payload: cases.approve_refund[0], subjectId: '5' };
  assert.equal(memberResultAllowed(c, { ...cases.approve_refund[1], moneyReturned: true, replayed: false }), false);
  assert.equal(memberResultAllowed(c, { ...cases.approve_refund[1], memberId: '6', replayed: false }), true, 'Household refund binds to exact refund ID, not the currently selected linked student');
  const p = { operation: 'record_refund_payment', payload: cases.record_refund_payment[0], subjectId: '5' };
  assert.equal(memberResultAllowed(p, { ...cases.record_refund_payment[1], evidence: 'provider_receipt', replayed: false }), false);
  assert.equal(memberPayloadAllowed('promote_test_results', { ...cases.promote_test_results[0], registrationIds: ['10', '11'] }), false);
  assert.equal(memberPayloadAllowed('record_test_results', { ...cases.record_test_results[0], results: [{ registrationId: '10', result: 'pass' }, { registrationId: '11', result: 'pass' }] }), false);
  assert.equal(memberPayloadAllowed('save_testing_roster', { ...cases.save_testing_roster[0], testDate: '2026-02-30' }), false);
});
test('onboarding validates selected member, stable keys and authoritative completion counts', () => {
  const raw = { memberId: '5', done: 1, total: 2, items: [{ key: 'profile', label: 'Profile', done: true, detail: 'S5', where: 'Profile' }, { key: 'waiver', label: 'Waiver', done: false, detail: 'Not signed', where: 'Documents' }] };
  assert.equal(onboardingFrom(raw, '5').done, 1);
  assert.equal(onboardingFrom(raw, '6'), null);
  assert.equal(onboardingFrom({ ...raw, done: 2 }, '5'), null);
  assert.equal(onboardingFrom({ ...raw, items: [raw.items[0], raw.items[0]], done: 2 }, '5'), null);
});
const ledger = () => ({ memberId: '5', canApprove: false, invoices: [{ id: '9', number: 'INV/9', date: '2026-11-01', total: 50, remaining: 0, currency: 'USD', paymentState: 'paid', settled: true, settlementEvidence: ['staff_recorded'], payments: [{ id: '4', amount: 50, date: '2026-11-01', journal: 'Cash', evidence: 'staff_recorded', provider: null, providerReference: false, transactionState: null }], refunds: [], refundable: true, version: 1 }] });
test('billing ledger projects settlement provenance, preserves role hint, and distinguishes empty from unreadable', () => {
  const parsed = ledgerFrom(ledger(), '5'); assert.equal(parsed.canApprove, false); assert.equal(parsed.invoices[0].payments[0].evidence, 'staff_recorded'); assert.equal(parsed.invoices[0].payments[0].providerReference, null);
  assert.equal(ledgerFrom(ledger(), '6'), null);
  assert.deepEqual(ledgerFrom({ memberId: '5', canApprove: false, invoices: [] }, '5').invoices, []);
  assert.equal(ledgerFrom({ memberId: '5', canApprove: true }, '5'), null);
  const malformed = ledger(); malformed.invoices[0].remaining = '0'; assert.equal(ledgerFrom(malformed, '5'), null);
  const provider = ledger(); provider.invoices[0].payments[0] = { ...provider.invoices[0].payments[0], evidence: 'provider_receipt', provider: 'Provider', providerReference: 'receipt-1', transactionState: 'done' }; assert.equal(ledgerFrom(provider, '5').invoices[0].payments[0].evidence, 'provider_receipt');
});
test('testing reads match by exact member and test IDs and reject ambiguous registration histories', () => {
  const raw = { rows: [{ memberId: '5', openTest: null }], ranks: [{ id: '2', name: 'Yellow', sequence: 2 }], tests: [{ id: '7', name: 'Test', date: '2026-11-04', state: 'scheduled', count: 2 }] };
  assert.equal(testingCatalogFrom(raw, '5').member.memberId, '5'); assert.equal(testingCatalogFrom(raw, '6').member, null);
  const row = { registrationId: '10', memberId: '5', name: 'Same Name', currentRank: 'White', targetRank: 'Yellow', result: 'pending', promotionId: null };
  const roster = { test: { id: '7', name: 'Test', date: '2026-11-04', state: 'scheduled', version: 1 }, school: 'School', rows: [row, { ...row, registrationId: '11', memberId: '6' }] };
  assert.equal(memberTestFrom(roster, '7').rows.length, 2); assert.equal(memberTestFrom(roster, '8'), null);
  assert.equal(memberTestFrom({ ...roster, rows: [row, row] }, '7'), null);
  const history = { rows: [{ id: '20', memberId: '5', rank: 'Yellow', stripes: 0, date: '2026-11-04', memberVersion: 2, source: 'Test', reversed: false, reversedBy: null, reversalReason: null, latest: true }, { id: '21', memberId: '6' }], more: true };
  assert.equal(promotionHistoryFrom(history, '5').rows.length, 1); assert.equal(promotionHistoryFrom(history, '5').capped, true);
});
test('completion retries preserve original payload/key, keep subject metadata local and reject a foreign-refund receipt', async () => {
  const command = { operation: 'approve_refund', payload: cases.approve_refund[0], subjectId: '5' }, calls = [];
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); if (calls.length === 1) throw Error('lost response'); return Response.json({ ...cases.approve_refund[1], replayed: true }); };
  assert.equal((await memberWrite(command, key)).outcome, 'notConfirmed'); assert.equal((await memberWrite(command, key)).result.replayed, true); assert.deepEqual(calls[0], calls[1]); assert.equal('subjectId' in calls[0], false);
  global.fetch = async () => Response.json({ ...cases.approve_refund[1], refundId: '99', replayed: false }); assert.equal((await memberWrite(command, key)).outcome, 'notConfirmed');
  global.fetch = async () => Response.json({ memberId: '6' }); assert.equal((await memberRead('member_onboarding', { memberId: '5' })).code, 'HUB_RESPONSE_UNREADABLE');
  global.fetch = async () => Response.json({ error: { code: 'FORBIDDEN' } }, { status: 403 }); assert.deepEqual(await memberWrite(command, key), { outcome: 'failed', code: 'FORBIDDEN' });
});
