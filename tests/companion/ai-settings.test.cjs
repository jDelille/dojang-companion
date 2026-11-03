const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_COMPANION_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(build, request.slice(2));
  return resolve.call(this, request, ...rest);
};
let answer;
const calls = [];
const load = Module._load;
Module._load = function (request, ...rest) {
  if (request === '@/server/hub-gateway') return { readHubAsStaff: async (...args) => { calls.push(args); return answer; } };
  return load.call(this, request, ...rest);
};
const { aiSettingsFrom } = require(path.join(build, 'domain/ai/settings.js'));
const { getAiSettings } = require(path.join(build, 'integrations/aiSettings.js'));
const settings = {
  enabled: false, configured: true, model: 'backend-configured-model', canEnable: false,
  siteVersion: 1730000000000000, configVersion: 1730000000000001, lastCheck: null,
};

test('AI settings use the exact read with server-derived scope; secrets are projected out', async () => {
  calls.length = 0;
  answer = { ok: true, result: { ...settings, apiKey: 'private', providerSecret: 'private' } };
  assert.deepEqual(await getAiSettings(), { outcome: 'loaded', settings });
  assert.deepEqual(calls, [['ai_settings', {}]]);
});

test('missing flags, string booleans, unsafe versions, and malformed checks are unavailable', async () => {
  const missing = { ...settings }; delete missing.enabled;
  for (const value of [missing, { ...settings, enabled: 'false' }, { ...settings, configVersion: 1.5 },
    { ...settings, model: '' }, { ...settings, lastCheck: { at: 'yesterday', model: null, mode: 'checked' } },
    { ...settings, lastCheck: undefined }]) {
    assert.equal(aiSettingsFrom(value), null);
    answer = { ok: true, result: value };
    assert.equal((await getAiSettings()).code, 'HUB_RESPONSE_UNREADABLE');
  }
});

test('confirmed false, absent activation receipt, and unsupported model are distinct', () => {
  assert.deepEqual(aiSettingsFrom({ ...settings, configured: false, model: null }), { ...settings, configured: false, model: null });
  const lastCheck = { at: '2026-11-02T18:00:00Z', model: 'checked-model', mode: 'AI-assisted draft - human review required' };
  assert.deepEqual(aiSettingsFrom({ ...settings, lastCheck }).lastCheck, lastCheck);
});

test('authentication, permission, configuration, and backend errors never become disabled settings', async () => {
  for (const code of ['SIGN_IN_REQUIRED', 'UNAUTHENTICATED', 'FORBIDDEN', 'HUB_NOT_CONFIGURED', 'BACKEND_UNAVAILABLE', 'INVALID_COMMAND']) {
    answer = { ok: false, code, status: 503 };
    const result = await getAiSettings();
    assert.equal(result.outcome, 'unavailable');
    assert.equal(result.code, code);
    assert.equal('settings' in result, false);
  }
});
