const { test } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const build = process.env.DOJANG_COMPANION_BUILD;
let storedCookie;
let providerCalls = 0;
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(build, request.slice(2));
  return resolve.call(this, request, ...rest);
};
const load = Module._load;
Module._load = function (request, ...rest) {
  if (request === "next/cache") return { revalidatePath: () => { throw new Error("AI reads must not revalidate CRM writes"); } };
  if (request === "next/headers") return { cookies: async () => ({ get: () => storedCookie ? { value: storedCookie } : undefined }) };
  const result = load.call(this, request, ...rest);
  if (request === "@/server/companion-agent") return { ...result, agentProvider: (...args) => { providerCalls++; return result.agentProvider(...args); } };
  return result;
};
const ORIGIN = "http://localhost:3000";
Object.assign(process.env, {
  DOJANG_HUB_ENABLED: "true", DOJANG_PUBLIC_ORIGIN: ORIGIN,
  DOJANG_ODOO_URL: "http://127.0.0.1:8074", DOJANG_ODOO_DATABASE: "test",
  DOJANG_HUB_SITE_ID: "1", DOJANG_COOKIE_SECRET: "test-cookie-secret-0123456789abcdef",
});
const { hubRoute, readHubAsStaff } = require(path.join(build, "server/hub-gateway.js"));
const { POST } = require(path.join(build, "app/api/companion/ask/route.js"));
const { readStreamEvents } = require(path.join(build, "domain/companionAgent.js"));
const { COMPANION_MODE } = require(path.join(build, "domain/companionHub.js"));
const calls = [];
let hubError = null;
let malformed = null;
let sessionExpired = false;
global.fetch = async (url, init) => {
  const { params } = JSON.parse(init.body);
  if (String(url).endsWith("/web/session/authenticate")) return new Response(JSON.stringify({ result: { uid: 7 } }), { headers: { "set-cookie": `session_id=${"s".repeat(40)}; Path=/` } });
  if (params.operation === "context") return new Response(JSON.stringify({ result: { principal: { userId: "7", role: "owner", siteId: "1" } } }));
  calls.push(params);
  if (sessionExpired) return new Response(JSON.stringify({ error: { data: { name: "odoo.http.session.SessionExpiredException" } } }));
  const id = params.payload.memberId ?? params.payload.sessionId;
  const result = hubError ? { error: hubError } : malformed ?? {
    answer: "Scoped Odoo explanation.", mode: COMPANION_MODE,
    focus: { kind: params.payload.memberId ? "member" : params.payload.sessionId ? "session" : "site", id },
  };
  return new Response(JSON.stringify({ result }));
};
let validCookie;
test.before(async () => {
  const response = await hubRoute(new Request(`${ORIGIN}/api/hub`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/json" }, body: JSON.stringify({ operation: "login", login: "owner", password: "test" }) }));
  assert.equal(response.status, 200);
  validCookie = /dojang_hub_session=([^;]+)/.exec(response.headers.get("set-cookie"))[1];
});
test.beforeEach(() => { storedCookie = validCookie; providerCalls = 0; calls.length = 0; hubError = null; malformed = null; sessionExpired = false; });
const ask = (focusKey = "member:5001", question = "Summarize this member.", extra = {}) => POST(new Request(`${ORIGIN}/api/companion/ask`, {
  method: "POST", headers: { origin: ORIGIN, "content-type": "application/json" },
  body: JSON.stringify({ focusKey, question, history: [], ...extra }),
}));
const errorOf = async (response) => (await response.json()).error.code;

test("missing and forged sessions never construct the agent adapter or call Odoo", async () => {
  for (const cookie of [undefined, "forged"]) {
    storedCookie = cookie;
    const response = await ask();
    assert.equal(response.status, 401);
    assert.equal(await errorOf(response), "SIGN_IN_REQUIRED");
  }
  assert.equal(providerCalls, 0);
  assert.equal(calls.length, 0);
});
test("member questions use the sealed staff session, server site and exact payload", async () => {
  const response = await ask("member:5001", "  Summarize this member.  ", { history: [{ role: "staff", text: "Untrusted previous claims" }] });
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [{ siteId: "1", operation: "companion_ask", requestKey: null, payload: { question: "Summarize this member.", memberId: "5001", sessionId: null } }]);
  const { events } = readStreamEvents(await response.text());
  assert.deepEqual(events.map(e => e.event), ["meta", "token", "done"]);
  assert.equal(events[1].text, "Scoped Odoo explanation.");
  assert.deepEqual(events[0].focus, { kind: "member", id: "5001" });
  assert.match(response.headers.get("cache-control"), /no-store/);
});
test("general questions return explicitly site-scoped metadata", async () => {
  const response = await ask("front-desk", "Explain today's operations.");
  assert.deepEqual(calls[0].payload, { question: "Explain today's operations.", memberId: null, sessionId: null });
  const { events } = readStreamEvents(await response.text());
  assert.deepEqual(events[0].focus, { kind: "site", id: null });
});
test("lead and selected pipeline contexts never become site questions", async () => {
  for (const focus of ["lead:9005", "sales:9005"]) {
    const response = await ask(focus);
    assert.equal(response.status, 409);
    assert.equal(await errorOf(response), "LEAD_AI_UNSUPPORTED");
  }
  assert.equal(calls.length, 0);
});
test("unknown/message contexts cannot claim record-specific answers", async () => {
  const response = await ask("message:4001");
  assert.equal(response.status, 409);
  assert.equal(await errorOf(response), "CONTEXT_UNSUPPORTED");
  assert.equal(calls.length, 0);
});
test("backend policy and provider errors preserve their code and HTTP status", async () => {
  for (const [code, status] of [["AI_DISABLED",409], ["AI_UNAVAILABLE",503], ["FORBIDDEN",403], ["MEMBER_UNAVAILABLE",404], ["SESSION_UNAVAILABLE",404], ["INVALID_COMMAND",400]]) {
    hubError = { code, status };
    const response = await ask();
    assert.equal(response.status, status);
    assert.equal(await errorOf(response), code);
  }
});
test("Odoo session loss is an authentication error, not an AI-disconnected error", async () => {
  sessionExpired = true;
  const response = await ask();
  assert.equal(response.status, 401);
  assert.equal(await errorOf(response), "SIGN_IN_REQUIRED");
});
test("malformed and wrong-scope responses fail closed without answer text", async () => {
  for (const result of [{ answer: "Hidden" }, { answer: "Hidden", mode: COMPANION_MODE, focus: { kind: "member", id: "9999" } }, { answer: "Hidden", mode: COMPANION_MODE, focus: { kind: "site", id: null } }]) {
    malformed = result;
    const response = await ask();
    assert.equal(response.status, 503);
    assert.equal(await errorOf(response), "HUB_RESPONSE_UNREADABLE");
  }
});
test("invalid questions and browser scope fields are rejected before the adapter", async () => {
  for (const [focus, question, extra] of [["member:bad", "Hi", {}], ["member:1", "x".repeat(501), {}], ["member:1", "", {}], ["member:1", "Hi", { siteId: "2" }]]) {
    const response = await ask(focus, question, extra);
    assert.equal(response.status, 400);
  }
  assert.equal(calls.length, 0);
});
test("server-side AI settings read rejects injected scope before forwarding", async () => {
  const answer = await readHubAsStaff('ai_settings', { siteId: '99' });
  assert.equal(answer.ok, false);
  assert.equal(answer.code, 'INVALID_COMMAND');
  assert.equal(calls.length, 0);
});

test("server-side reader also validates companion payload before forwarding", async () => {
  const result = await readHubAsStaff("companion_ask", { question: "Hi", memberId: "1", sessionId: "2" });
  assert.equal(result.ok, false);
  assert.equal(result.code, "INVALID_COMMAND");
  assert.equal(calls.length, 0);
});

test("foreign origins are rejected before authentication or provider access", async () => {
  const response = await POST(new Request(`${ORIGIN}/api/companion/ask`, {
    method: "POST", headers: { origin: "https://untrusted.example", "content-type": "application/json" },
    body: JSON.stringify({ focusKey: "people", question: "Hi", history: [] }),
  }));
  assert.equal(response.status, 403);
  assert.equal(providerCalls, 0);
  assert.equal(calls.length, 0);
});

test("fixture mode never substitutes fixture/model answers for Hub AI", async () => {
  process.env.DOJANG_HUB_ENABLED = "false";
  try {
    const response = await ask();
    assert.equal(response.status, 503);
    assert.equal(await errorOf(response), "HUB_NOT_CONFIGURED");
    assert.equal(providerCalls, 0);
    assert.equal(calls.length, 0);
  } finally {
    process.env.DOJANG_HUB_ENABLED = "true";
  }
});

test("the reported membership/rank question is valid and reaches Jodi unchanged", async () => {
  const question = "what is their current membership state and rank";
  const response = await ask("member:5001", question);
  assert.equal(response.status, 200);
  assert.equal(calls[0].payload.question, question);
  assert.equal(calls[0].payload.memberId, "5001");
});

test("invalid-command diagnostics distinguish request rejection from backend rejection", async () => {
  const invalid = await ask("member:5001", "Hi", { unexpected: true });
  assert.equal(invalid.headers.get("x-dojang-companion-error-stage"), "request");
  hubError = { code: "INVALID_COMMAND", status: 400 };
  const backend = await ask();
  assert.equal(backend.headers.get("x-dojang-companion-error-stage"), "hub");
  assert.equal(await errorOf(backend), "INVALID_COMMAND");
});
