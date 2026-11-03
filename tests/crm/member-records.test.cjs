const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const build = process.env.DOJANG_CRM_BUILD;
const { memberRecordsFrom } = require(path.join(build, 'domain/memberRecords.js'));
const { memberMessagesFrom } = require(path.join(build, 'domain/memberMessages.js'));
const history = { id: '1', rank: 'White belt', stripes: 2, date: '2026-10-01' };
const subscription = { id: '2', plan: 'Kids plan', state: 'active', nextInvoiceDate: '2026-12-01' };
const invoice = { id: '3', number: 'INV/003', kind: 'out_invoice', date: '2026-11-01', paymentState: 'partial', total: 200, remaining: 50, currency: 'USD', scope: 'household' };
const details = () => ({ canEdit: true, limits: { rankHistory: 20 }, rankHistory: [history], courses: [{ id: '1', name: 'Kids Taekwondo' }], billing: { limit: 50, subscriptions: [subscription], invoices: [invoice] } });

test('member records project source fields and preserve household invoice scope without manufacturing a personal balance', () => {
  const raw = details(); raw.billing.invoices[0] = { ...invoice, secret: 'discard', version: 123 };
  const parsed = memberRecordsFrom(raw);
  assert.deepEqual(parsed.rankHistory, { outcome: 'loaded', rows: [history], capped: false });
  assert.equal(parsed.invoices.rows[0].scope, 'household'); assert.equal(parsed.invoices.rows[0].remaining, 50);
  assert.equal('secret' in parsed.invoices.rows[0], false); assert.equal('balance' in parsed, false);
  assert.equal(parsed.subscriptions.rows[0].nextInvoiceDate, '2026-12-01');
});
test('management-only fields are suppressed even if returned accidentally to a restricted or unknown role', () => {
  for (const permission of [false, undefined, 'true']) {
    const parsed = memberRecordsFrom({ ...details(), canEdit: permission });
    for (const field of ['courses', 'subscriptions', 'invoices']) {
      assert.equal(parsed[field].outcome, 'unavailable'); assert.equal('rows' in parsed[field], false);
      assert.equal(parsed[field].reason, permission === false ? 'restricted' : 'unsupported');
    }
    assert.equal(parsed.rankHistory.outcome, 'loaded');
  }
});
test('empty, unsupported, malformed and truncated member sections remain distinct', () => {
  const empty = memberRecordsFrom({ canEdit: true, rankHistory: [], courses: [], limits: { rankHistory: 20 }, billing: { limit: 50, invoices: [], subscriptions: [] } });
  assert.deepEqual(empty.invoices, { outcome: 'loaded', rows: [], capped: false });
  assert.equal(memberRecordsFrom({ canEdit: true }).invoices.reason, 'unsupported');
  assert.equal(memberRecordsFrom({ ...details(), rankHistory: [history, history] }).rankHistory.reason, 'unreadable');
  assert.equal(memberRecordsFrom({ ...details(), rankHistory: [{ ...history, date: '2026-02-30' }] }).rankHistory.reason, 'unreadable');
  assert.equal(memberRecordsFrom({ ...details(), limits: {} }).rankHistory.capped, true);
  const capped = { ...details(), rankHistory: Array.from({ length: 20 }, (_, i) => ({ ...history, id: String(i + 1) })) };
  assert.equal(memberRecordsFrom(capped).rankHistory.capped, true);
  assert.equal(memberRecordsFrom({ ...details(), courses: null }).courses.reason, 'unreadable');
});
test('malformed financial data invalidates its section without hiding valid membership or training information', () => {
  for (const bad of [{ ...invoice, total: '200' }, { ...invoice, remaining: NaN }, { ...invoice, scope: 'guessed_parent' }, { ...invoice, date: 'yesterday' }, { ...invoice, kind: 'entry' }]) {
    const raw = details(); raw.billing.invoices = [bad];
    const parsed = memberRecordsFrom(raw);
    assert.equal(parsed.invoices.reason, 'unreadable'); assert.equal(parsed.subscriptions.outcome, 'loaded'); assert.equal(parsed.courses.outcome, 'loaded');
  }
  const raw = details(); raw.billing.invoices = [{ ...invoice, kind: 'out_refund', remaining: 0 }];
  assert.equal(memberRecordsFrom(raw).invoices.rows[0].kind, 'out_refund');
});

const message = (id, memberId) => ({ id, memberId, text: 'Hello', channel: 'whatsapp', guardianName: 'Guardian', state: 'received' });
const context = () => ({ members: [{ id: '5' }, { id: '6' }], messages: [message('1', '5'), message('2', '6'), message('3', null)], deliveries: [{ id: '9', messageId: '1', state: 'accepted' }] });
test('member messages match only authoritative member IDs and retain accepted delivery as accepted', () => {
  const raw = context(); raw.messages[1].guardianName = 'Same Name'; raw.messages[0].guardianName = 'Same Name';
  const parsed = memberMessagesFrom(raw, '5');
  assert.deepEqual(parsed.rows.map(m => m.id), ['1']); assert.equal(parsed.rows[0].deliveries[0].state, 'accepted');
  assert.equal(memberMessagesFrom(raw, '99'), null);
  raw.messages = [];
  raw.deliveries = [];
  assert.deepEqual(memberMessagesFrom(raw, '5'), { rows: [], capped: false, deliveriesCapped: false });
});
test('member messages reject malformed reads and report source limits instead of claiming complete history', () => {
  assert.equal(memberMessagesFrom({ ...context(), messages: undefined }, '5'), null);
  assert.equal(memberMessagesFrom({ ...context(), messages: [message('1', '5'), message('1', '5')] }, '5'), null);
  assert.equal(memberMessagesFrom({ ...context(), deliveries: [{ id: '9', messageId: '1', state: 'sent' }] }, '5'), null);
  assert.equal(memberMessagesFrom({ ...context(), messages: [message('1', undefined)] }, '5'), null);
  const capped = context(); capped.messages = Array.from({ length: 50 }, (_, i) => message(String(i + 1), i ? '6' : '5'));
  assert.equal(memberMessagesFrom(capped, '5').capped, true);
});
