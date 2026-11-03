const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_CRM_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) { return resolve.call(this, request.startsWith('@/') ? path.join(build, request.slice(2)) : request, ...rest); };
const { attendedStage, stageReviewContextFrom, isStageProposalPayload, isStageProposalResult } = require(path.join(build, 'domain/postTrial.js'));
const { getStageReviewContext } = require(path.join(build, 'integrations/postTrial.js'));
const { proposeStage } = require(path.join(build, 'integrations/crmWrites.js'));
const raw = () => ({ lead: { id: '3', name: 'Lead', version: 10, stageId: '1', stage: 'New' }, stages: [{ id: '1', name: 'New' }, { id: '9', name: 'Trial Attended' }], tasks: [{ id: '8', relatedType: 'lead', relatedId: '3', summary: 'Existing follow-up', due: '2026-11-04', owner: 'Staff', state: 'planned' }] });
const payload = { leadId: '3', expectedVersion: 10, stageId: '9', reason: 'Trial #7 attended. Review stage.', due: '2026-11-04' };
const receipt = () => ({ leadId: '3', taskId: '90', state: 'proposed', stageChanged: false, replayed: false });
const key = 'post-trial-request-00001';

test('stage review context projects configured stages and explicitly linked tasks, rejecting identity mismatches', () => {
  const parsed = stageReviewContextFrom(raw(), '3');
  assert.equal(parsed.lead.version, 10); assert.equal(parsed.tasks[0].summary, 'Existing follow-up');
  assert.equal(stageReviewContextFrom(raw(), '4'), null);
  assert.equal(stageReviewContextFrom({ ...raw(), tasks: [{ ...raw().tasks[0], relatedId: '4' }] }, '3'), null);
  assert.equal(stageReviewContextFrom({ ...raw(), stages: undefined }, '3'), null);
  assert.ok(stageReviewContextFrom({ ...raw(), tasks: [], stages: [] }, '3'));
  assert.equal(stageReviewContextFrom({ ...raw(), stages: [...raw().stages, raw().stages[0]] }, '3'), null);
});

test('Trial Attended suggestion requires one explicit configured label and never supplies an invented stage ID', () => {
  assert.equal(attendedStage(raw().stages).id, '9');
  assert.equal(attendedStage([{ id: '91', name: ' trial attended ' }]).id, '91');
  assert.equal(attendedStage([{ id: '2', name: 'Trial' }]), null);
  assert.equal(attendedStage([]), null);
  assert.equal(attendedStage([{ id: '1', name: 'Trial attended' }, { id: '2', name: 'Trial Attended' }]), null);
});

test('stage proposal allows exact versioned review-task payload and refuses scope, direct-move and invalid dates', () => {
  assert.ok(isStageProposalPayload(payload));
  for (const bad of [{ ...payload, due: '2026-02-30' }, { ...payload, expectedVersion: -1 }, { ...payload, reason: 'x'.repeat(121) }, { ...payload, stageChanged: true }, { ...payload, siteId: '99' }]) assert.equal(isStageProposalPayload(bad), false);
  assert.ok(isStageProposalResult(receipt(), payload));
  assert.equal(isStageProposalResult({ ...receipt(), stageChanged: true }, payload), false);
  assert.equal(isStageProposalResult({ ...receipt(), leadId: '4' }, payload), false);
});

test('stage review read uses existing lead_details contract with honest empty/malformed/auth states', async () => {
  const calls = [];
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); return Response.json(raw()); };
  assert.equal((await getStageReviewContext('3')).outcome, 'loaded');
  assert.deepEqual(calls[0], { operation: 'lead_details', payload: { leadId: '3' }, requestKey: null });
  global.fetch = async () => Response.json({ ...raw(), stages: undefined });
  assert.deepEqual(await getStageReviewContext('3'), { outcome: 'unavailable', code: 'HUB_RESPONSE_UNREADABLE' });
  global.fetch = async () => Response.json({ error: { code: 'SIGN_IN_REQUIRED' } }, { status: 401 });
  assert.deepEqual(await getStageReviewContext('3'), { outcome: 'unavailable', code: 'SIGN_IN_REQUIRED' });
});

test('stage proposal uncertain retry retains exact payload/key and never treats a moved stage as proposal success', async () => {
  const calls = [];
  global.fetch = async (_, init) => { calls.push(JSON.parse(init.body)); if (calls.length === 1) throw Error('lost response'); return Response.json({ ...receipt(), replayed: true }); };
  assert.equal((await proposeStage(payload, key)).outcome, 'notConfirmed');
  assert.equal((await proposeStage(payload, key)).result.replayed, true);
  assert.deepEqual(calls[0], calls[1]); assert.equal(calls[0].operation, 'propose_stage');
  global.fetch = async () => Response.json({ ...receipt(), stageChanged: true });
  assert.equal((await proposeStage(payload, key)).outcome, 'notConfirmed');
  for (const code of ['VERSION_CONFLICT', 'FORBIDDEN', 'SIGN_IN_REQUIRED']) {
    global.fetch = async () => Response.json({ error: { code } }, { status: 409 });
    assert.deepEqual(await proposeStage(payload, key), { outcome: 'failed', code });
  }
});
