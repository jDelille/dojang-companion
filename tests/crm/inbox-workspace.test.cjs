const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_CRM_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) { return resolve.call(this, request.startsWith('@/') ? path.join(build, request.slice(2)) : request, ...rest); };
const { isInboxContext, inboxMessages, selectedInboxMessage, matchesQueue } = require(path.join(build, 'domain/inboxWorkspace.js'));
const { getInboxContext, runInboxAction } = require(path.join(build, 'integrations/hub.js'));
const message = (id, extra = {}) => ({ id, text: 'Move class please', state: 'resolved', summary: '', reply: '', mode: 'Not drafted', revision: 0, channel: 'whatsapp', guardianName: 'Parent Chen', contactRef: 'provider-1', memberId: '5', sessionId: '8', ...extra });
const context = () => ({ principal: { userId: '2', siteId: '1', name: 'Staff', role: 'manager' }, members: [{ id: '5', name: 'Maya Chen', version: 1, state: 'active', rank: 'White' }], sessions: [{ id: '8', title: 'Kids class', startsAt: null, future: true, version: 1 }], messages: [message('1'), message('2', { reply: 'Draft response', channel: 'sms' }), message('3'), message('4')], deliveries: [{ id: '10', messageId: '3', state: 'accepted', providerRef: null, approvedBy: 'Staff', approvedAt: null }, { id: '11', messageId: '4', state: 'uncertain', providerRef: null, approvedBy: 'Staff', approvedAt: null }], timeline: [], capabilities: { identity: 'odoo_user_session', ai: 'disabled', inbound: 'not_configured', outbound: 'not_configured', ebGym: 'bridge_not_installed', productionReady: false } });

test('Roster-style queues preserve approval, delivery and uncertainty as separate states', () => {
 const c = context();
 assert.deepEqual(inboxMessages(c, 'needs', 'all', '').map(m => m.id), ['1', '2', '4']);
 assert.deepEqual(inboxMessages(c, 'open', 'all', '').map(m => m.id), ['1', '2', '3', '4']);
 assert.equal(inboxMessages(c, 'closed', 'all', '').length, 0);
 for (const state of ['failed', 'cancelled', 'uncertain']) { c.deliveries[1].state = state; assert.equal(matchesQueue(c, c.messages[3], 'needs'), true); }
 c.deliveries[0].state = 'delivered'; assert.equal(matchesQueue(c, c.messages[2], 'closed'), true); assert.equal(matchesQueue(c, c.messages[2], 'open'), false);
});
test('search intersects channel and queue using authoritative linked identity', () => {
 const c = context();
 assert.deepEqual(inboxMessages(c, 'needs', 'sms', 'MAYA kids').map(m => m.id), ['2']);
 assert.equal(inboxMessages(c, 'needs', 'whatsapp', 'nonexistent').length, 0);
 c.members[0].id = '6'; assert.equal(inboxMessages(c, 'all', 'all', 'Maya').length, 0);
});
test('selection cannot leak a record from another filtered queue', () => {
 const c = context(), rows = inboxMessages(c, 'needs', 'all', '');
 assert.equal(selectedInboxMessage(rows, '3').id, '1');
 assert.equal(selectedInboxMessage([], '3'), null);
});
test('strict snapshot validation rejects malformed, duplicate and orphan records', () => {
 assert.equal(isInboxContext(context()), true);
 for (const change of [c => c.principal = null, c => c.messages[0].revision = '1', c => c.messages[0].memberId = 'bad', c => c.messages.push(c.messages[0]), c => c.deliveries[0].state = 'sent', c => c.deliveries[0].messageId = '99', c => c.deliveries[1].messageId = '3', c => c.members[0].name = null, c => c.sessions[0].startsAt = 'not-a-date', c => c.capabilities.outbound = 'ready']) {
  const c = context(); change(c); assert.equal(isInboxContext(c), false);
 }
});
test('a valid empty inbox is distinct from an unreadable snapshot and authentication loss', async () => {
 const original = global.fetch;
 try {
  const c = context(); c.messages = []; c.deliveries = [];
  global.fetch = async () => Response.json(c);
  assert.equal((await getInboxContext()).outcome, 'loaded');
  global.fetch = async () => Response.json({ ...c, messages: [null] });
  assert.equal((await getInboxContext()).outcome, 'unavailable');
  global.fetch = async () => Response.json({ error: { code: 'SIGN_IN_REQUIRED' } }, { status: 401 });
  assert.equal((await getInboxContext()).code, 'SIGN_IN_REQUIRED');
 } finally { global.fetch = original; }
});
test('wrong student resolution, unknown delivery state and malformed drafts never confirm success', async () => {
 const original = global.fetch;
 try {
  global.fetch = async () => Response.json({ messageId: '1', memberId: '6', sessionId: '8', revision: 1, replayed: false });
  assert.equal((await runInboxAction('resolve', { messageId: '1', memberId: '5', sessionId: '8', expectedRevision: 0 }, 'inbox-test-request-01')).outcome, 'notConfirmed');
  global.fetch = async () => Response.json({ deliveryId: '10', memberId: '5', sessionId: '8', state: 'sent', replayed: false });
  assert.equal((await runInboxAction('approve_reply', { messageId: '1', expectedRevision: 0, reply: 'Yes' }, 'inbox-test-request-01')).outcome, 'notConfirmed');
  global.fetch = async () => Response.json({ messageId: '1', memberId: '5', sessionId: '8', revision: 1, reply: null, replayed: false });
  assert.equal((await runInboxAction('draft', { messageId: '1', expectedRevision: 0 }, 'inbox-test-request-01')).outcome, 'notConfirmed');
 } finally { global.fetch = original; }
});
test('uncertain approval checks retain exactly the same request identity and payload', async () => {
 const original = global.fetch, calls = [], payload = { messageId: '1', expectedRevision: 1, reply: 'Reviewed text' };
 try {
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); if (calls.length === 1) throw Error('Network lost'); return Response.json({ deliveryId: '10', memberId: '5', sessionId: '8', state: 'queued', replayed: true }); };
  assert.equal((await runInboxAction('approve_reply', payload, 'same-request-key')).outcome, 'notConfirmed');
  const answer = await runInboxAction('approve_reply', payload, 'same-request-key');
  assert.equal(answer.outcome, 'done'); assert.equal(answer.result.state, 'queued'); assert.equal(answer.result.replayed, true);
  assert.deepEqual(calls[0], calls[1]);
 } finally { global.fetch = original; }
});

const { inboxMemberTasks, inboxClassOptions, messageTaskSummary } = require(path.join(build, 'domain/inboxWork.js'));
const task = (id, changes = {}) => ({ id, relatedType: 'member', relatedId: '5', relatedName: 'Maya Chen', summary: 'Follow up', due: '2026-11-04', owner: 'Manager', state: 'planned', version: 1, canComplete: true, ...changes });
test('member task context uses exact type and identity without matching names or message-reference text', () => {
 const raw = { tasks: [task('1'), task('2', { relatedType: 'lead' }), task('3', { relatedId: '6', summary: 'Message #1 Maya Chen' })], moreTasks: true };
 const result = inboxMemberTasks(raw, '5'); assert.deepEqual(result.tasks.map(t => t.id), ['1']); assert.equal(result.capped, true);
 assert.deepEqual(inboxMemberTasks({ tasks: [], moreTasks: false }, '5'), { tasks: [], capped: false });
});
test('malformed or duplicate member tasks do not become an empty or partial list', () => {
 for (const raw of [{ tasks: [task('1'), task('1')], moreTasks: false }, { tasks: [task('1', { version: '1' })], moreTasks: false }, { tasks: [task('1', { due: '2026-02-30' })], moreTasks: false }, { tasks: [task('1')], moreTasks: 'false' }, { tasks: [task('1', { canComplete: undefined })], moreTasks: false }]) assert.equal(inboxMemberTasks(raw, '5'), null);
});
test('class options require exact member access and a still-future timestamp, without claiming eligibility', () => {
 const c = context(); c.sessions = [{ id: '8', title: 'Kids class', startsAt: '2026-11-04T20:00:00Z', future: true, version: 1 }, { id: '9', title: 'Kids earlier', startsAt: '2026-11-04T18:00:00Z', future: true, version: 1 }, { id: '10', title: 'Kids past', startsAt: '2026-11-03T12:00:00Z', future: true, version: 1 }, { id: '11', title: 'Kids unavailable', startsAt: '2026-11-04T22:00:00Z', future: false, version: 1 }];
 const now = Date.parse('2026-11-03T20:00:00Z');
 const rows = inboxClassOptions(c, '5', 'kids', now); assert.deepEqual(rows.map(s => s.id), ['9', '8']);
 assert.equal('eligible' in rows[0], false); assert.equal('spaces' in rows[0], false);
 assert.equal(inboxClassOptions(c, '6', '', now).length, 0); assert.equal(inboxClassOptions(c, '5', 'adult', now).length, 0);
});
test('message reference is an explicit task-summary seed, never a hidden relationship payload', () => {
 assert.equal(messageTaskSummary('42'), 'Follow up on inbox message #42'); assert.equal(messageTaskSummary('bad'), '');
});
test('invalid inbox commands are rejected locally and stale resolution receipts cannot confirm success', async () => {
 const original = global.fetch; let calls = 0;
 try {
  global.fetch = async () => { calls++; return Response.json({ messageId: '1', memberId: '5', sessionId: '8', revision: 4, replayed: false }); };
  assert.equal((await runInboxAction('resolve', { messageId: '1', memberId: '5', sessionId: '8', expectedRevision: 4, actor: 'admin' }, 'inbox-test-request-01')).code, 'INVALID_COMMAND');
  assert.equal((await runInboxAction('draft', { messageId: '1', expectedRevision: 0 }, 'short')).code, 'INVALID_COMMAND');
  assert.equal(calls, 0);
  assert.equal((await runInboxAction('resolve', { messageId: '1', memberId: '5', sessionId: '8', expectedRevision: 4 }, 'inbox-test-request-01')).outcome, 'notConfirmed');
  assert.equal(calls, 1);
 } finally { global.fetch = original; }
});
