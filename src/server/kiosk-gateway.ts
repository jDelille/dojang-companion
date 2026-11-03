// Adapted from dojang/companion src/server/odoo-gateway.ts.
// Kiosk-only pairing and session reads. Staff identity stays on the Hub session.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { SessionOption } from '../contracts/kiosk-attendance';
import type { KioskDataMode } from '../domain/kiosk/dataMode';

export function kioskMode(env: NodeJS.ProcessEnv = process.env): KioskDataMode {
  if (env.DOJANG_INTEGRATION_MODE === 'odoo-test') return 'odoo-test';
  if (env.NODE_ENV !== 'production' && (env.DOJANG_INTEGRATION_MODE === 'fixture'
    || (!env.DOJANG_INTEGRATION_MODE && env.DOJANG_HUB_ENABLED !== 'true'))) return 'fixture';
  return 'unavailable';
}
export type KioskGatewayConfig = { origin: string; backend: string; token: string; key: string; pairKey: string; secret: string };
const COOKIE = 'dojang_kiosk_test';
const TTL = 2 * 60 * 60 * 1000;
const HEADERS = { 'cache-control': 'private, no-store', vary: 'Cookie', 'x-dojang-data-source': 'odoo-test' };
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const digest = (v: string) => createHash('sha256').update(v).digest();
const equal = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));
const scope = (c: KioskGatewayConfig) => digest(`${c.origin}:${c.backend}:${c.token}:${c.key}`).toString('hex');
const sign = (c: KioskGatewayConfig, value: string) => createHmac('sha256', c.secret).update(value).digest('base64url');

export function kioskConfig(env: NodeJS.ProcessEnv = process.env): KioskGatewayConfig {
  if (kioskMode(env) !== 'odoo-test' || env.NEXT_PUBLIC_DEMO_MODE === 'true') throw new Error('Kiosk test mode required');
  function origin(name: string) {
    const url = new URL(env[name] ?? '');
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) || url.username || url.password
      || url.pathname !== '/' || url.search || url.hash) throw new Error('Invalid kiosk origin');
    return url.origin;
  }
  function required(name: string, min = 32) {
    const value = env[name];
    if (!value || value.length < min || value.length > 256 || /[\r\n]/.test(value)) throw new Error('Missing kiosk configuration');
    return value;
  }
  const c = { origin: origin('DOJANG_PUBLIC_ORIGIN'), backend: origin('DOJANG_ODOO_URL'),
    token: required('DOJANG_KIOSK_TOKEN', 20), key: required('DOJANG_KIOSK_GATEWAY_KEY'),
    pairKey: required('DOJANG_KIOSK_PAIR_KEY'), secret: required('DOJANG_COOKIE_SECRET') };
  if (equal(c.key, c.pairKey) || equal(c.token, c.pairKey) || equal(c.secret, c.pairKey)) throw new Error('Separate pairing credential required');
  return c;
}

export function kioskCookie(c: KioskGatewayConfig, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ role: 'kiosk', scope: scope(c), expiresAt: now + TTL })).toString('base64url');
  return `${payload}.${sign(c, payload)}`;
}
export function kioskAuthorized(c: KioskGatewayConfig, cookies: string, now = Date.now()) {
  const entries = cookies.split(';').map(v => v.trim()).filter(v => v.startsWith(`${COOKIE}=`));
  if (entries.length !== 1 || entries[0].length > 2048) return false;
  const [payload, signature, extra] = entries[0].slice(COOKIE.length + 1).split('.');
  if (!payload || !signature || extra || !equal(signature, sign(c, payload))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return parsed.role === 'kiosk' && parsed.scope === scope(c) && Number.isSafeInteger(parsed.expiresAt)
      && parsed.expiresAt > now && parsed.expiresAt <= now + TTL;
  } catch { return false; }
}
export function kioskUnavailable(status = 503) {
  return Response.json({ code: status === 403 ? 'FORBIDDEN' : status === 400 ? 'INVALID_COMMAND' : 'CAPABILITY_DISABLED',
    title: status === 403 ? 'This device must be paired by staff.' : status === 400 ? 'Invalid kiosk request.' : 'This kiosk service is unavailable.' }, { status, headers: HEADERS });
}
async function readJson(response: Request | Response, limit: number) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Error('Body limit'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}
export async function pairKiosk(request: Request, c: KioskGatewayConfig) {
  if (request.headers.get('origin') !== c.origin || !request.headers.get('content-type')?.includes('application/json')) return kioskUnavailable(403);
  let body: unknown;
  try { body = await readJson(request, 2048); } catch { return kioskUnavailable(400); }
  if (!object(body) || Object.keys(body).sort().join() !== 'pairKey,role' || body.role !== 'kiosk'
    || typeof body.pairKey !== 'string' || body.pairKey.length > 256 || !equal(body.pairKey, c.pairKey)) return kioskUnavailable(403);
  return Response.json({ paired: true }, { headers: { ...HEADERS,
    'set-cookie': `${COOKIE}=${kioskCookie(c)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200${c.origin.startsWith('https:') ? '; Secure' : ''}` } });
}

const text = (v: unknown, max = 240): v is string => typeof v === 'string' && !!v.trim() && v.length <= max;
const integer = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const timestamp = (v: unknown): v is string => text(v, 64) && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
export function kioskSessionsFrom(value: unknown): SessionOption[] | null {
  if (!object(value) || !Array.isArray(value.sessions) || value.sessions.length > 100) return null;
  const sessions: SessionOption[] = [];
  const ids = new Set<string>();
  for (const s of value.sessions) {
    if (!object(s) || typeof s.sessionId !== 'string' || !/^[1-9][0-9]{0,9}$/.test(s.sessionId) || Number(s.sessionId) > 2147483647
      || ids.has(s.sessionId) || !text(s.title) || !timestamp(s.startsAt) || !timestamp(s.endsAt)
      || Date.parse(s.endsAt) <= Date.parse(s.startsAt) || !integer(s.version) || !integer(s.capacity) || !integer(s.seatsTaken)
      || (s.instructor !== undefined && s.instructor !== null && !text(s.instructor))
      || (s.location !== undefined && !text(s.location)) || (s.timeZone !== undefined && !text(s.timeZone, 80))) return null;
    if (typeof s.timeZone === 'string') { try { new Intl.DateTimeFormat('en', { timeZone: s.timeZone }); } catch { return null; } }
    ids.add(s.sessionId);
    sessions.push({ sessionId: s.sessionId, title: s.title, startsAt: s.startsAt, endsAt: s.endsAt,
      version: s.version, capacity: s.capacity, seatsTaken: s.seatsTaken,
      ...(s.instructor !== undefined ? { instructor: s.instructor as string | null } : {}),
      ...(s.location !== undefined ? { location: s.location as string } : {}),
      ...(s.timeZone !== undefined ? { timeZone: s.timeZone as string } : {}) });
  }
  return sessions;
}
export async function readKioskSessions(request: Request, c: KioskGatewayConfig, fetcher: typeof fetch = fetch) {
  if (!kioskAuthorized(c, request.headers.get('cookie') ?? '')) return kioskUnavailable(403);
  try {
    const response = await fetcher(`${c.backend}/kiosk/v2/sessions`, { method: 'POST', cache: 'no-store', redirect: 'error',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${c.key}` },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', id: 'kiosk-sessions', params: { token: c.token } }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(12000)]) });
    if (!response.ok) return kioskUnavailable();
    const body = await readJson(response, 131072);
    if (!object(body) || body.error || !object(body.result) || body.result.type) return kioskUnavailable();
    const sessions = kioskSessionsFrom(body.result);
    return sessions ? Response.json(sessions, { headers: HEADERS }) : kioskUnavailable();
  } catch { return kioskUnavailable(); }
}
