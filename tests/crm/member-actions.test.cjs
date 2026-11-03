const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_CRM_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) { return resolve.call(this, request.startsWith('@/') ? path.join(build, request.slice(2)) : request, ...rest); };
const { memberPayloadAllowed, memberResultAllowed, paymentUrlAllowed } = require(path.join(build, 'domain/memberActions.js'));
const { projectWorkspace, workspacePayloadAllowed } = require(path.join(build, 'domain/memberWorkspace.js'));
const { memberToolContextFrom, memberExtraAllowed, bookableSessionsFrom } = require(path.join(build, 'domain/memberToolContext.js'));
const { memberWrite, memberRead } = require(path.join(build, 'integrations/memberActions.js'));
const cases = {
  create_task: [{ relatedType: 'member', relatedId: '5', summary: 'Follow up with guardian', due: '2026-11-04' }, { memberId: '5', taskId: '91' }],
  update_member: [{ memberId: '5', expectedVersion: 1, expectedPartnerVersion: 2, changes: { name: 'Updated' } }, { memberId: '5', version: 3, state: 'updated' }],
  book: [{ memberId: '5', sessionId: '118', expectedVersion: 1 }, { memberId: '5', sessionId: '118', enrollmentId: '74', state: 'registered' }],
  change_class: [{ memberId: '5', sessionId: '119', fromSessionId: '118', expectedVersion: 1 }, { memberId: '5', sessionId: '119', enrollmentId: '75', state: 'registered' }],
  checkout: [{ memberId: '5', sessionId: '118' }, { memberId: '5', sessionId: '118', attendanceId: '9', checkedOutAt: '2026-11-03T18:00:00Z' }],
  rank: [{ memberId: '5', rankId: '2', expectedVersion: 1, stripes: 1, reason: 'Staff assessment' }, { memberId: '5', rankHistoryId: '9', state: 'awarded' }],
  update_member_photo: [{ memberId: '5', expectedVersion: 1, image: null }, { memberId: '5', state: 'photo_removed', version: 2, hasPhoto: false }],
  payment_link: [{ memberId: '5', invoiceId: '9', expectedVersion: 1, expectedAmount: 50 }, { memberId: '5', invoiceId: '9', state: 'checkout_ready', amount: 50, currency: 'USD', checkoutUrl: 'https://odoo.example.invalid/my/invoices/9?access_token=demo' }],
  archive_member: [{ memberId: '5', expectedVersion: 1, reason: 'Duplicate reviewed' }, { memberId: '5', state: 'archived', reason: 'Duplicate reviewed', cancelledBookingIds: ['74'], courseRostersKept: 1 }],
  restore_member: [{ memberId: '5', expectedVersion: 1, reason: 'Restore existing profile' }, { memberId: '5', state: 'restored', reason: 'Restore existing profile', bookingsRestored: 0 }],
  mark_attendance: [{ memberId: '5', sessionId: '118', status: 'present', expectedVersion: 1, reason: 'Observed in class' }, { memberId: '5', sessionId: '118', state: 'attendance_recorded', logId: '9', before: 'pending', after: 'present', reason: 'Observed in class', reversal: false, version: 2 }],
  set_guardian_kiosk_pin: [{ memberId: '5', guardianId: '7', pin: '491827', reason: 'Verified guardian' }, { memberId: '5', guardianId: '7', state: 'guardian_pin_set', reason: 'Verified guardian', messageSent: false }],
  revoke_guardian_kiosk_pin: [{ memberId: '5', guardianId: '7', reason: 'Guardian requested' }, { memberId: '5', guardianId: '7', state: 'guardian_pin_revoked', reason: 'Guardian requested', messageSent: false }],
  record_consent: [{ memberId: '5', partnerId: '7', channel: 'email', purpose: 'marketing', state: 'withdrawn', source: 'in_person', evidence: 'Verified request' }, { memberId: '5', partnerId: '7', state: 'consent_recorded', consent: 'withdrawn', channel: 'email', purpose: 'marketing', messageSent: false }],
  link_guardian: [{ partnerId: '7', memberIds: ['5'], channel: 'whatsapp', contactRef: 'verified-contact', verificationRef: 'Staff verified', allowReply: true }, { bindingId: '9', state: 'verified_by_staff' }],
  sign_waiver: [{ memberId: '5', expectedVersion: 1, signerPartnerId: '7', signedByName: 'Guardian', contentVersion: 'a'.repeat(64), agreed: true, signature: 'data:image/png;base64,AAAA' }, { memberId: '5', signatureId: '9', state: 'waiver_signed', signedBy: 'Guardian', messageSent: false, version: 2, pdfStored: true }],
  assign_course_members: [{ templateId: '1', expectedVersion: 1, addMemberIds: ['5'], removeMemberIds: [], reason: 'Approved course assignment', reviewToken: 'a'.repeat(64) }, { templateId: '1', state: 'course_roster_updated', added: ['5'], removed: [], bookingsCreated: 2, bookingsCancelled: 0, version: 2 }],
};

for (const [operation, [payload, receipt]] of Object.entries(cases)) test(`member action ${operation} is exact, versioned where supported, and validates its receipt`, () => {
  assert.equal(memberPayloadAllowed(operation, payload), true);
  assert.equal(memberPayloadAllowed(operation, { ...payload, siteId: '99' }), false);
  assert.equal(memberPayloadAllowed(operation, { ...payload, role: 'owner' }), false);
  assert.equal(memberResultAllowed({ operation, payload }, { ...receipt, replayed: false }), true);
  const wrong = operation === 'link_guardian' ? { ...receipt, bindingId: '0' } : operation === 'assign_course_members' ? { ...receipt, added: ['6'] } : { ...receipt, memberId: '6' };
  assert.equal(memberResultAllowed({ operation, payload }, { ...wrong, replayed: false }), false);
});
test('sensitive commands reject broad changes, alternate identities and unreviewed signing', () => {
  assert.equal(memberPayloadAllowed('update_member', { ...cases.update_member[0], changes: { membership_state: 'active' } }), false);
  assert.equal(memberPayloadAllowed('sign_waiver', { ...cases.sign_waiver[0], agreed: false }), false);
  assert.equal(memberPayloadAllowed('record_consent', { ...cases.record_consent[0], channel: ['email'] }), false);
  assert.equal(memberPayloadAllowed('link_guardian', { ...cases.link_guardian[0], memberIds: ['5', '6'] }), false);
  assert.equal(memberPayloadAllowed('assign_course_members', { ...cases.assign_course_members[0], addMemberIds: ['5', '6'] }), false);
  assert.equal(memberResultAllowed({ operation: 'set_guardian_kiosk_pin', payload: cases.set_guardian_kiosk_pin[0] }, { ...cases.set_guardian_kiosk_pin[1], replayed: false, pin: '491827' }), false);
});
test('checkout URLs require HTTPS, the exact invoice path and the approved Odoo origin', () => {
  for (const url of ['javascript:alert(1)', 'http://odoo.example.invalid/my/invoices/9', 'https://user:pass@odoo.example.invalid/my/invoices/9', 'https://odoo.example.invalid/my/invoices/10']) assert.equal(paymentUrlAllowed(url, '9', 'https://odoo.example.invalid'), false);
  assert.equal(paymentUrlAllowed('https://other.example.invalid/my/invoices/9', '9', 'https://odoo.example.invalid'), false);
  assert.equal(paymentUrlAllowed(cases.payment_link[1].checkoutUrl, '9', 'https://odoo.example.invalid'), true);
});
const rawWorkspace = () => ({ member: { id: '5', name: 'Student' }, canEdit: true, family: { household: 'Family', members: [{ id: '5', name: 'Student' }], householdGuardians: [{ id: '7', name: 'Guardian', primary: true }], guardians: [] }, safety: { allergies: 'Sensitive allergy', medicalNotes: 'Sensitive medical note', emergencyNote: null, contacts: [] }, documents: { waiver: { state: 'not_signed', signedBy: null, signedAt: null }, files: [] }, timeline: [{ id: '9', memberId: '5', sessionId: '118', action: 'book', actor: 'Staff', at: '2026-11-03T18:00:00Z' }] });
test('member workspace exposes only the requested section and never sends medical fields with a family/documents/timeline read', () => {
  for (const section of ['family', 'documents', 'timeline']) {
    const parsed = projectWorkspace(rawWorkspace(), { memberId: '5', section });
    assert.ok(parsed); assert.equal(JSON.stringify(parsed).includes('Sensitive'), false); assert.equal('safety' in parsed, false);
  }
  assert.equal(projectWorkspace(rawWorkspace(), { memberId: '5', section: 'safety' }).data.medicalNotes, 'Sensitive medical note');
  assert.equal(projectWorkspace(rawWorkspace(), { memberId: '6', section: 'family' }), null);
  assert.equal(workspacePayloadAllowed({ memberId: '5', section: 'all' }), false);
  const raw = rawWorkspace(); raw.canEdit = false;
  assert.deepEqual(projectWorkspace(raw, { memberId: '5', section: 'safety' }).unavailable, 'restricted');
  assert.equal(projectWorkspace(raw, { memberId: '5', section: 'safety' }).data, null);
});
test('workspace rejects malformed metadata, cross-member timeline entries, and distinguishes unsupported from empty', () => {
  const raw = rawWorkspace(); raw.timeline[0].memberId = '6';
  assert.equal(projectWorkspace(raw, { memberId: '5', section: 'timeline' }), null);
  raw.documents.files = [{ id: '1', name: 'File', bytes: '200', mimeType: 'application/pdf' }];
  assert.equal(projectWorkspace(raw, { memberId: '5', section: 'documents' }), null);
  delete raw.documents;
  assert.equal(projectWorkspace(raw, { memberId: '5', section: 'documents' }).unavailable, 'unsupported');
  assert.equal(projectWorkspace(rawWorkspace(), { memberId: '5', section: 'documents' }).data.files.length, 0);
});
test('member action read validates requested identity, and an uncertain write reuses exactly the original key and payload', async () => {
  const command = { operation: 'book', payload: cases.book[0] }, calls = [];
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); if (calls.length === 1) throw Error('lost response'); return Response.json({ ...cases.book[1], replayed: true }); };
  assert.equal((await memberWrite(command, 'member-action-request-001')).outcome, 'notConfirmed');
  assert.equal((await memberWrite(command, 'member-action-request-001')).result.replayed, true);
  assert.deepEqual(calls[0], calls[1]);
  global.fetch = async () => Response.json({ member: { id: '6' } });
  assert.equal((await memberRead('member_details', { memberId: '5' })).code, 'HUB_RESPONSE_UNREADABLE');
  global.fetch = async () => Response.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  assert.deepEqual(await memberWrite(command, 'member-action-request-001'), { outcome: 'failed', code: 'FORBIDDEN' });
});
test('member tool inputs reject incomplete snapshots and malformed session lists rather than presenting confirmed empty options', () => {
  const raw = { member: { id: '5', name: 'Student', version: 1, partnerVersion: 2, email: '', phone: '', photo: null }, canEdit: true, canEditContact: true, ranks: [], bookings: [], attendance: [], billing: null };
  assert.ok(memberToolContextFrom(raw, '5'));
  assert.equal(memberToolContextFrom(raw, '6'), null);
  assert.equal(memberToolContextFrom({ ...raw, bookings: undefined }, '5'), null);
  assert.equal(bookableSessionsFrom({ members: [{ id: '5' }], sessions: [{ id: '1', title: 'Class', startsAt: 'bad', version: 1, future: true }] }, '5'), null);
  assert.deepEqual(bookableSessionsFrom({ members: [{ id: '5' }], sessions: [] }, '5'), []);
  assert.equal(memberExtraAllowed('archive', { memberId: '5', version: 1, futureBookingCount: 1, openMemberships: 0, portalAccounts: 0 }, '5'), false);
  assert.equal(memberExtraAllowed('attendance', { sessions: undefined }, '5'), false);
});
