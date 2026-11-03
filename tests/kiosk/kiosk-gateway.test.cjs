require('./register-alias.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const build = process.env.DOJANG_KIOSK_BUILD;
const { kioskMode, kioskConfig, kioskCookie, kioskAuthorized, kioskSessionsFrom, pairKiosk, readKioskSessions } = require(path.join(build, 'server/kiosk-gateway.js'));
const env = {
  DOJANG_INTEGRATION_MODE: 'odoo-test', DOJANG_PUBLIC_ORIGIN: 'http://localhost:3000',
  DOJANG_ODOO_URL: 'http://127.0.0.1:8074', DOJANG_KIOSK_TOKEN: 'token-'.repeat(6),
  DOJANG_KIOSK_GATEWAY_KEY: 'gateway-'.repeat(5), DOJANG_KIOSK_PAIR_KEY: 'pairing-'.repeat(5),
  DOJANG_COOKIE_SECRET: 'cookie-'.repeat(6),
};
const config = kioskConfig(env);
const row = { sessionId: '101', title: 'Class', startsAt: '2026-11-03T17:00:00Z', endsAt: '2026-11-03T18:00:00Z',
  version: 1730000000000000, capacity: 24, seatsTaken: 8, instructor: null, location: 'Test site', timeZone: 'America/Phoenix' };
const request = () => new Request(`${config.origin}/api/v2/sessions`, { headers: { cookie: `dojang_kiosk_test=${kioskCookie(config)}` } });
const pairing = (body, origin = config.origin) => new Request(`${config.origin}/api/integration/pair`, {
  method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body),
});

test('real, fixture, invalid and production modes cannot silently fall back', () => {
  assert.equal(kioskMode(env), 'odoo-test');
  assert.equal(kioskMode({ NODE_ENV: 'development' }), 'fixture');
  assert.equal(kioskMode({ NODE_ENV: 'development', DOJANG_HUB_ENABLED: 'true' }), 'unavailable');
  assert.equal(kioskMode({ NODE_ENV: 'production', DOJANG_INTEGRATION_MODE: 'fixture' }), 'unavailable');
  assert.equal(kioskMode({ DOJANG_INTEGRATION_MODE: 'typo' }), 'unavailable');
  for (const overrides of [{ DOJANG_KIOSK_GATEWAY_KEY: '' }, { DOJANG_ODOO_URL: 'https://odoo.example/path' },
    { DOJANG_ODOO_URL: 'http://odoo.example' }, { DOJANG_KIOSK_PAIR_KEY: env.DOJANG_KIOSK_GATEWAY_KEY },
    { NEXT_PUBLIC_DEMO_MODE: 'true' }]) assert.throws(() => kioskConfig({ ...env, ...overrides }));
});

test('kiosk pairing sets a scoped HttpOnly cookie and returns no credentials', async () => {
  const response = await pairKiosk(pairing({ role: 'kiosk', pairKey: config.pairKey }), config);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { paired: true });
  assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict; Max-Age=7200/);
  assert.equal(kioskAuthorized(config, response.headers.get('set-cookie')), true);
  const https = { ...config, origin: 'https://kiosk.example' };
  const secure = await pairKiosk(new Request('https://kiosk.example/api/integration/pair', {
    method: 'POST', headers: { origin: https.origin, 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'kiosk', pairKey: config.pairKey }),
  }), https);
  assert.match(secure.headers.get('set-cookie'), /; Secure/);
});

test('pairing rejects role escalation, scope injection, foreign origins and oversized requests', async () => {
  for (const body of [{ role: 'staff', pairKey: config.pairKey }, { role: 'kiosk', pairKey: 'wrong' },
    { role: 'kiosk', pairKey: config.pairKey, siteId: '99' }]) assert.equal((await pairKiosk(pairing(body), config)).status, 403);
  assert.equal((await pairKiosk(pairing({ role: 'kiosk', pairKey: config.pairKey }, 'https://foreign.example'), config)).status, 403);
  assert.equal((await pairKiosk(pairing({ role: 'kiosk', pairKey: 'x'.repeat(3000) }), config)).status, 400);
});

test('forged, duplicate, expired, wrong-origin and rotated device cookies cannot authorize reads', async () => {
  const now = Date.now();
  const valid = `dojang_kiosk_test=${kioskCookie(config, now)}`;
  assert.equal(kioskAuthorized(config, valid, now), true);
  assert.equal(kioskAuthorized(config, `${valid}; ${valid}`, now), false);
  assert.equal(kioskAuthorized(config, `${valid}forged`, now), false);
  assert.equal(kioskAuthorized(config, valid, now + 7200001), false);
  assert.equal(kioskAuthorized({ ...config, key: 'rotated' }, valid, now), false);
  assert.equal(kioskAuthorized({ ...config, backend: 'https://other.example' }, valid, now), false);
  let calls = 0;
  assert.equal((await readKioskSessions(new Request(`${config.origin}/api/v2/sessions`), config, async () => { calls++; })).status, 403);
  assert.equal(calls, 0);
});

test('session read calls the fixed backend path with server-held credentials and projects public fields', async () => {
  let call;
  const response = await readKioskSessions(request(), config, async (url, init) => {
    call = { url, init };
    return Response.json({ result: { sessions: [{ ...row, members: ['private'], apiKey: 'private' }] } });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [row]);
  assert.equal(call.url, `${config.backend}/kiosk/v2/sessions`);
  assert.equal(call.init.headers.authorization, `Bearer ${config.key}`);
  assert.deepEqual(JSON.parse(call.init.body).params, { token: config.token });
  assert.equal(call.init.redirect, 'error');
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(response.headers.get('x-dojang-data-source'), 'odoo-test');
});

test('confirmed empty sessions differ from malformed data and backend failures', async () => {
  assert.deepEqual(kioskSessionsFrom({ sessions: [] }), []);
  for (const bad of [{}, { sessions: [row, row] }, { sessions: [{ ...row, capacity: '24' }] },
    { sessions: [{ ...row, version: -1 }] }, { sessions: [{ ...row, timeZone: 'not-a-timezone' }] },
    { sessions: [{ ...row, endsAt: row.startsAt }] }]) assert.equal(kioskSessionsFrom(bad), null);
  for (const body of [{ result: {} }, { error: { message: config.key } },
    { result: { type: 'urn:problem', code: 'FORBIDDEN' } }]) {
    const response = await readKioskSessions(request(), config, async () => Response.json(body));
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes(config.key), false);
  }
  assert.equal((await readKioskSessions(request(), config, async () => { throw new Error(config.token); })).status, 503);
});

test('real mode routes refuse roster and attendance rather than serving mock data', async () => {
  const before = process.env.DOJANG_INTEGRATION_MODE;
  process.env.DOJANG_INTEGRATION_MODE = 'odoo-test';
  try {
    const { GET } = require(path.join(build, 'app/api/v2/sessions/[sessionId]/roster/route.js'));
    const { POST } = require(path.join(build, 'app/api/v2/attendance/check-ins/route.js'));
    assert.equal((await GET(request(), { params: Promise.resolve({ sessionId: '101' }) })).status, 503);
    assert.equal((await POST(pairing({}))).status, 503);
  } finally {
    if (before === undefined) delete process.env.DOJANG_INTEGRATION_MODE;
    else process.env.DOJANG_INTEGRATION_MODE = before;
  }
});
