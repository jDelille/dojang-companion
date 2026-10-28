import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/*
   The real Hub connection: DreamOS server -> Odoo's POST /companion/hub/action
   (Jodi's dojo_companion_hub), as the signed-in staff member. SERVER ONLY: only
   app/api/hub/route.ts and server components import this file.

   Ported from Companion 1cab554b src/server/hub-gateway.ts, same settings and
   same session handling:
   - Staff sign in with their own Odoo login. Odoo's /web/session/authenticate
     gives a session id; it is sealed (AES-256-GCM, key from DOJANG_COOKIE_SECRET)
     into the HttpOnly cookie dojang_hub_session for 2 hours. The browser never
     sees the Odoo session or any credential.
   - Every call sends that session to Odoo with the configured site
     (DOJANG_HUB_SITE_ID). Odoo decides who the user is and what their
     dojo.hub.grant allows; nothing here claims a user or role.

   Two ways in, one session: POST /api/hub from the browser (hubRoute), and server
   components reading as the same signed-in staff member (readHubAsStaff), which
   reads the same cookie. There is no other sign-in path.

   READ-ONLY in DreamOS for now: only the reads below are forwarded. Every write
   (resolve, draft, approve_reply, prepare_lead_action, …) is refused here with
   HUB_READ_ONLY before it reaches Odoo, so no reply can be queued and nothing
   can be dispatched from DreamOS.

   Settings (server environment, never NEXT_PUBLIC_):
     DOJANG_HUB_ENABLED      "true" selects the Hub; otherwise the development fixtures
     DOJANG_ODOO_URL         e.g. http://127.0.0.1:8074 (https, or http on localhost)
     DOJANG_ODOO_DATABASE    the Odoo database name
     DOJANG_HUB_SITE_ID      the dojo.hub.site id
     DOJANG_COOKIE_SECRET    32-256 characters, only for sealing the session cookie
     DOJANG_PUBLIC_ORIGIN    this app's own origin, e.g. http://localhost:3000
*/

type Config = { origin: string; backend: string; database: string; siteId: string; secret: string };

const COOKIE_NAME = "dojang_hub_session";
const SESSION_HOURS = 2;
const SESSION_MS = SESSION_HOURS * 60 * 60 * 1000;
const BODY_LIMIT = 16384;
const TIMEOUT_MS = 45000;

// The Hub reads DreamOS forwards. Everything else is refused (see above).
//   context          Inbox, and the People member list
//   member_details   Member 360 (owner, manager or instructor grants only)
//   crm_context      the Sales pipeline (payload exactly { query })
//   lead_details     one lead's record (payload exactly { leadId })
//   session_roster   one class's booked members and their attendance, for Front
//                    Desk arrivals (payload exactly { sessionId }; instructors
//                    only their own classes)
const FORWARDED_READS = new Set(["context", "member_details", "crm_context", "lead_details", "session_roster"]);

const RESPONSE_HEADERS = { "cache-control": "private, no-store", vary: "Cookie" };

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const problem = (code: string, status: number, headers: Record<string, string> = {}) =>
  Response.json({ error: { code, status } }, { status, headers: { ...RESPONSE_HEADERS, ...headers } });

// Is the real Hub the data source? (The fixtures are used otherwise.)
export function hubEnabled() {
  return process.env.DOJANG_HUB_ENABLED === "true";
}

// Only https, or http on this machine; no path, user or query
function isSafeOrigin(url: URL) {
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  const schemeOk = url.protocol === "https:" || (url.protocol === "http:" && local);
  return schemeOk && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash;
}

function hubConfig(): Config {
  const env = process.env;
  const origin = new URL(env.DOJANG_PUBLIC_ORIGIN || "");
  const backend = new URL(env.DOJANG_ODOO_URL || "");
  if (!isSafeOrigin(origin) || !isSafeOrigin(backend)) throw Error("Invalid origin");

  const database = env.DOJANG_ODOO_DATABASE || "";
  const siteId = env.DOJANG_HUB_SITE_ID || "";
  const secret = env.DOJANG_COOKIE_SECRET || "";
  if (!/^[A-Za-z0-9_-]{1,63}$/.test(database)) throw Error("Invalid database");
  if (!/^[1-9][0-9]{0,9}$/.test(siteId) || Number(siteId) > 2147483647) throw Error("Invalid site");
  if (secret.length < 32 || secret.length > 256) throw Error("Invalid cookie secret");
  return { origin: origin.origin, backend: backend.origin, database, siteId, secret };
}

// The sealed cookie only works for this app, this Odoo, this database and this site
const scopeOf = (config: Config) => [config.origin, config.backend, config.database, config.siteId];

const keyOf = (config: Config) => createHash("sha256").update("dojang-hub-v1:" + config.secret).digest();

function seal(config: Config, session: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyOf(config), iv);
  const data = Buffer.from(JSON.stringify({ session, scope: scopeOf(config), expires: Date.now() + SESSION_MS }));
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

function sessionFrom(config: Config, request: Request): string | null {
  const found = (request.headers.get("cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(COOKIE_NAME + "="));
  if (found.length !== 1) return null;
  return unseal(config, found[0].slice(COOKIE_NAME.length + 1));
}

// The Odoo session inside a sealed cookie value, if it's genuine, current and for this scope
function unseal(config: Config, sealed: string): string | null {
  if (sealed.length > 2048) return null;
  try {
    const data = Buffer.from(sealed, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", keyOf(config), data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    const value: unknown = JSON.parse(
      Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString(),
    );
    if (!isObject(value)) return null;
    const expires = Number(value.expires);
    if (!Number.isSafeInteger(expires) || expires <= Date.now() || expires > Date.now() + SESSION_MS) return null;
    if (JSON.stringify(value.scope) !== JSON.stringify(scopeOf(config))) return null;
    if (typeof value.session !== "string" || !/^[A-Za-z0-9_-]{32,128}$/.test(value.session)) return null;
    return value.session;
  } catch {
    return null;
  }
}

function sessionCookie(config: Config, value: string, maxAgeSeconds: number) {
  const secure = config.origin.startsWith("https:") ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

async function readBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw Error("Invalid content type");
  const text = await request.text();
  if (text.length > BODY_LIMIT) throw Error("Body too large");
  return JSON.parse(text);
}

// Odoo said the session is gone (signed out, expired, or Odoo restarted)
class SessionExpired extends Error {}

// One JSON-RPC call to Odoo, with the staff member's session if there is one
async function rpc(config: Config, path: string, params: Record<string, unknown>, session: string | null) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (session) headers.cookie = "session_id=" + session;
  const response = await fetch(config.backend + path, {
    method: "POST",
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params }),
  });
  if (!response.ok) throw Error("Backend unavailable");
  const value: unknown = await response.json();
  if (!isObject(value)) throw Error("Backend rejected request");
  if (value.error) {
    const data = isObject(value.error) && isObject(value.error.data) ? value.error.data : null;
    if (data?.name === "odoo.http.session.SessionExpiredException") throw new SessionExpired();
    throw Error("Backend rejected request");
  }
  return { response, result: value.result };
}

// Staff sign-in: { operation: "login", login, password }. The password goes to
// Odoo once and is never stored.
async function signIn(config: Config, data: Record<string, unknown>) {
  const { login, password } = data;
  if (
    Object.keys(data).sort().join() !== "login,operation,password" ||
    typeof login !== "string" || !login.trim() || login.length > 200 ||
    typeof password !== "string" || !password || password.length > 1024
  ) {
    return problem("INVALID_COMMAND", 400);
  }
  try {
    const { response, result } = await rpc(
      config,
      "/web/session/authenticate",
      { db: config.database, login, password },
      null,
    );
    const session = /\bsession_id=([A-Za-z0-9_-]{32,128});/.exec(response.headers.get("set-cookie") || "")?.[1];
    if (!isObject(result) || !Number.isSafeInteger(result.uid) || Number(result.uid) <= 0 || !session) {
      return problem("SIGN_IN_FAILED_OR_MFA_REQUIRED", 401);
    }
    // Signed in to Odoo, but is this user allowed on this site? (dojo.hub.grant)
    const context = await rpc(
      config,
      "/companion/hub/action",
      { siteId: config.siteId, operation: "context", payload: {} },
      session,
    );
    if (!isObject(context.result) || context.result.error || !isObject(context.result.principal)) {
      return problem("NO_SITE_ACCESS", 403);
    }
    return Response.json(context.result, {
      headers: { ...RESPONSE_HEADERS, "set-cookie": sessionCookie(config, seal(config, session), SESSION_HOURS * 3600) },
    });
  } catch {
    return problem("SIGN_IN_FAILED_OR_MFA_REQUIRED", 401);
  }
}

async function signOut(config: Config, session: string) {
  let backendRevoked = true;
  try {
    await rpc(config, "/web/session/destroy", {}, session);
  } catch {
    backendRevoked = false;
  }
  return Response.json(
    { signedOut: true, backendRevoked },
    { headers: { ...RESPONSE_HEADERS, "set-cookie": sessionCookie(config, "", 0) } },
  );
}

type ReadAnswer = { ok: true; result: Record<string, unknown> } | { ok: false; code: string; status: number };

// One Hub read as the signed-in staff member, with the configured site
async function forwardRead(
  config: Config,
  session: string,
  operation: string,
  payload: Record<string, unknown>,
): Promise<ReadAnswer> {
  try {
    const { result } = await rpc(
      config,
      "/companion/hub/action",
      { siteId: config.siteId, operation, payload, requestKey: null },
      session,
    );
    if (!isObject(result)) throw Error("Invalid result");
    if (isObject(result.error)) {
      const status = [400, 401, 403, 404, 409, 422, 503].includes(Number(result.error.status))
        ? Number(result.error.status)
        : 503;
      const code =
        typeof result.error.code === "string" && /^[A-Z_]{1,80}$/.test(result.error.code)
          ? result.error.code
          : "BACKEND_UNAVAILABLE";
      return { ok: false, code, status };
    }
    return { ok: true, result };
  } catch (error) {
    // Odoo forgot the session (signed out, expired, restarted): sign in again
    if (error instanceof SessionExpired) return { ok: false, code: "SIGN_IN_REQUIRED", status: 401 };
    return { ok: false, code: "BACKEND_UNAVAILABLE", status: 503 };
  }
}

// For server components (People, Member 360, Sales, lead records): a Hub read as
// the staff member signed in through /api/hub, from the same sealed cookie. Never
// a fallback.
export async function readHubAsStaff(
  operation: "context" | "member_details" | "crm_context" | "lead_details",
  payload: Record<string, unknown>,
): Promise<ReadAnswer> {
  let config: Config;
  try {
    config = hubConfig();
  } catch {
    return { ok: false, code: "HUB_NOT_CONFIGURED", status: 503 };
  }
  const cookieStore = await cookies();
  const sealed = cookieStore.get(COOKIE_NAME)?.value;
  const session = sealed ? unseal(config, sealed) : null;
  if (!session) return { ok: false, code: "SIGN_IN_REQUIRED", status: 401 };
  return forwardRead(config, session, operation, payload);
}

// POST /api/hub when the Hub is the data source
export async function hubRoute(request: Request): Promise<Response> {
  let config: Config;
  try {
    config = hubConfig();
  } catch {
    return problem("HUB_NOT_CONFIGURED", 503);
  }
  if (request.headers.get("origin") !== config.origin) return problem("FORBIDDEN", 403);

  let data: unknown;
  try {
    data = await readBody(request);
  } catch {
    return problem("INVALID_COMMAND", 400);
  }
  if (!isObject(data) || typeof data.operation !== "string") return problem("INVALID_COMMAND", 400);
  const operation = data.operation;

  if (operation === "login") return signIn(config, data);

  const session = sessionFrom(config, request);
  if (!session) return problem("SIGN_IN_REQUIRED", 401);

  if (operation === "logout") {
    if (Object.keys(data).join() !== "operation") return problem("INVALID_COMMAND", 400);
    return signOut(config, session);
  }

  if (Object.keys(data).sort().join() !== "operation,payload,requestKey" || !isObject(data.payload)) {
    return problem("INVALID_COMMAND", 400);
  }
  if (!FORWARDED_READS.has(operation)) return problem("HUB_READ_ONLY", 403);
  if (data.requestKey !== null) return problem("INVALID_COMMAND", 400);

  const answer = await forwardRead(config, session, operation, data.payload);
  if (answer.ok) return Response.json(answer.result, { headers: RESPONSE_HEADERS });
  // A session Odoo no longer knows: also drop the stale cookie
  const clear: Record<string, string> =
    answer.code === "SIGN_IN_REQUIRED" ? { "set-cookie": sessionCookie(config, "", 0) } : {};
  return problem(answer.code, answer.status, clear);
}
