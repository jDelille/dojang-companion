// The DreamOS Hub gateway's allowlist (src/server/hub-gateway.ts): which
// operations reach Odoo and which are refused before they do. Odoo is a fake
// fetch here; nothing leaves this machine. Run by tools/test-hub-gateway.sh.
const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");

// Map "@/..." to the compiled build, and stub next/headers (only readHubAsStaff
// uses it, and these tests don't)
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(process.env.DOJANG_GATEWAY_BUILD, request.slice(2));
  return resolve.call(this, request, ...rest);
};
const load = Module._load;
const revalidated = [];
Module._load = function (request, ...rest) {
  if (request === "next/headers") return { cookies: async () => ({ get: () => undefined }) };
  if (request === "next/cache") return { revalidatePath: (route) => revalidated.push(route) };
  return load.call(this, request, ...rest);
};

const ORIGIN = "http://localhost:3000";
Object.assign(process.env, {
  DOJANG_PUBLIC_ORIGIN: ORIGIN,
  DOJANG_ODOO_URL: "http://127.0.0.1:8074",
  DOJANG_ODOO_DATABASE: "dojang_test",
  DOJANG_HUB_SITE_ID: "1",
  DOJANG_COOKIE_SECRET: "test-cookie-secret-0123456789abcdef",
});

const { hubRoute } = require(path.join(process.env.DOJANG_GATEWAY_BUILD, "server/hub-gateway.js"));

// The fake Odoo: records every Hub call it gets
const hubCalls = [];
let hubReply;
global.fetch = async (url, init) => {
  const params = JSON.parse(init.body).params;
  if (String(url).endsWith("/web/session/authenticate")) {
    return new Response(JSON.stringify({ jsonrpc: "2.0", result: { uid: 7 } }), {
      headers: { "content-type": "application/json", "set-cookie": `session_id=${"s".repeat(40)}; Path=/` },
    });
  }
  hubCalls.push(params);
  let result = { principal: { userId: "7", name: "Test Owner", role: "owner", siteId: "1" } };
  if (params.operation === "prepare_lead_action") {
    result = {
      leadId: params.payload.leadId, taskId: "501", kind: "follow_up", state: "prepared",
      messageSent: false, bookingCreated: false, membershipCreated: false, replayed: false,
    };
  }
  if (params.operation === "complete_task") result = { taskId: params.payload.taskId, leadId: "9008", state: "done", replayed: false };
  if (params.operation === "add_lead_note") result = { leadId: params.payload.leadId, noteId: "91", state: "saved", messageSent: false, replayed: false };
  if (params.operation === "create_lead") result = { leadId: "9100", version: 1729000000000000, replayed: false };
  if (hubReply) result = hubReply;
  return new Response(JSON.stringify({ jsonrpc: "2.0", result }), { headers: { "content-type": "application/json" } });
};

const post = (body, cookie) =>
  hubRoute(
    new Request(`${ORIGIN}/api/hub`, {
      method: "POST",
      headers: { origin: ORIGIN, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    }),
  );

const KEY = "dfm-0b6f6a2e-5c1d-4d8a-9f7e-123456789abc";
const PAYLOAD = { leadId: "9008", expectedVersion: 1729000000000000, kind: "follow_up", reason: "No open next action.", due: "2026-10-29" };

let cookie = "";
test.before(async () => {
  const response = await post({ operation: "login", login: "owner", password: "secret" });
  assert.equal(response.status, 200);
  cookie = /dojang_hub_session=[^;]+/.exec(response.headers.get("set-cookie"))[0];
  hubCalls.length = 0;
});
test.beforeEach(() => {
  hubCalls.length = 0;
  revalidated.length = 0;
  hubReply = undefined;
});

async function errorOf(response) {
  return (await response.json()).error.code;
}

test("prepare_lead_action with a valid payload and request key is forwarded as is", async () => {
  const response = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY }, cookie);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.taskId, "501");
  assert.equal(body.messageSent, false);
  assert.equal(hubCalls.length, 1);
  assert.deepEqual(hubCalls[0], { siteId: "1", operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY });
});

test("the same request key is passed through unchanged on a retry", async () => {
  await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY }, cookie);
  await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY }, cookie);
  assert.deepEqual(hubCalls.map((call) => call.requestKey), [KEY, KEY]);
});

test("prepare_lead_action without a request key is refused before Odoo", async () => {
  const response = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: null }, cookie);
  assert.equal(response.status, 400);
  assert.equal(await errorOf(response), "INVALID_COMMAND");
  const short = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: "short" }, cookie);
  assert.equal(short.status, 400);
  assert.equal(hubCalls.length, 0);
});

test("an extra payload key is refused before Odoo", async () => {
  const response = await post(
    { operation: "prepare_lead_action", payload: { ...PAYLOAD, ownerId: "3" }, requestKey: KEY },
    cookie,
  );
  assert.equal(response.status, 400);
  assert.equal(hubCalls.length, 0);
});

test("a kind other than follow_up is refused before Odoo", async () => {
  for (const kind of ["trial", "reactivation", "conversion"]) {
    const response = await post({ operation: "prepare_lead_action", payload: { ...PAYLOAD, kind }, requestKey: KEY }, cookie);
    assert.equal(response.status, 400);
  }
  assert.equal(hubCalls.length, 0);
});

test("malformed fields are refused before Odoo", async () => {
  const bad = [
    { ...PAYLOAD, leadId: "abc" },
    { ...PAYLOAD, expectedVersion: "1" },
    { ...PAYLOAD, reason: "   " },
    { ...PAYLOAD, reason: "x".repeat(801) },
    { ...PAYLOAD, due: "tomorrow" },
  ];
  for (const payload of bad) {
    const response = await post({ operation: "prepare_lead_action", payload, requestKey: KEY }, cookie);
    assert.equal(response.status, 400);
  }
  assert.equal(hubCalls.length, 0);
});

test("other writes stay refused with HUB_READ_ONLY", async () => {
  const writes = {
    assign_lead: { leadId: "1", expectedVersion: 1, ownerId: "2" },
    propose_stage: { leadId: "1", expectedVersion: 1, stageId: "2", reason: "x", due: "2026-10-29" },
    update_lead: { leadId: "1", expectedVersion: 1, changes: { name: "X" } },
    reserve_trial: { leadId: "1" },
    create_broadcast: { title: "x" },
  };
  for (const [operation, payload] of Object.entries(writes)) {
    const response = await post({ operation, payload, requestKey: KEY }, cookie);
    assert.equal(response.status, 403, operation);
    assert.equal(await errorOf(response), "HUB_READ_ONLY", operation);
  }
  assert.equal(hubCalls.length, 0);
});

const INTERNAL_WRITES = {
  complete_task: { taskId: "501", expectedVersion: 1729000000000000, feedback: "Spoke with guardian." },
  add_lead_note: { leadId: "9008", expectedVersion: 1729000000000000, note: "Prefers afternoon sessions." },
};
test("internal write errors and unreadable receipts do not invalidate records", async () => {
  for (const operation of Object.keys(INTERNAL_WRITES)) {
    const payload = INTERNAL_WRITES[operation];
    for (const code of ["VERSION_CONFLICT", "FORBIDDEN", "SIGN_IN_REQUIRED"]) {
      hubReply = { error: { code, status: code === "VERSION_CONFLICT" ? 409 : code === "FORBIDDEN" ? 403 : 401 } };
      assert.equal(await errorOf(await post({ operation, payload, requestKey: KEY }, cookie)), code);
    }
    hubReply = { state: "done" };
    assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 200);
  }
  assert.equal(revalidated.length, 0);
});
test("confirmed member task completion invalidates its member and task queue", async () => {
  hubReply = { taskId: "501", memberId: "42", state: "done", replayed: true };
  assert.equal((await post({ operation: "complete_task", payload: INTERNAL_WRITES.complete_task, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(revalidated, ["/crm", "/crm/follow-ups", "/front-desk", "/people/42"]);
});
for (const [operation, payload] of Object.entries(INTERNAL_WRITES)) {
  test(`${operation} forwards exact version, payload, configured site and same retry key`, async () => {
    for (let attempt = 0; attempt < 2; attempt++) assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 200);
    assert.deepEqual(hubCalls, [0, 1].map(() => ({ siteId: "1", operation, payload, requestKey: KEY })));
    assert.deepEqual(revalidated, [0, 1].flatMap(() => ["/crm", "/crm/follow-ups", "/front-desk", "/crm/leads/9008"]));
  });
  test(`${operation} rejects invalid payloads, keys, sessions and actor overrides`, async () => {
    const textKey = operation === "complete_task" ? "feedback" : "note";
    const max = operation === "complete_task" ? 1000 : 2000;
    for (const bad of [
      { ...payload, expectedVersion: "1" }, { ...payload, expectedVersion: -1 },
      { ...payload, expectedVersion: 1.5 }, { ...payload, expectedVersion: Number.MAX_SAFE_INTEGER + 1 },
      { ...payload, [textKey]: " " }, { ...payload, [textKey]: "x".repeat(max + 1) },
      { ...payload, siteId: "99" }, { ...payload, actorId: "99" },
    ]) assert.equal((await post({ operation, payload: bad, requestKey: KEY }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: null }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: KEY })).status, 401);
    assert.equal((await post({ operation, payload, requestKey: KEY }, "dojang_hub_session=forged")).status, 401);
    assert.equal(hubCalls.length, 0);
    assert.equal(revalidated.length, 0);
  });
}

const INBOX_WRITES = {
  resolve: { messageId: "301", memberId: "5001", sessionId: "6101", expectedRevision: 0 },
  draft: { messageId: "301", expectedRevision: 1 },
  approve_reply: { messageId: "301", expectedRevision: 2, reply: "We'll confirm a makeup class with you." },
};
for (const [operation, payload] of Object.entries(INBOX_WRITES)) {
  test(`inbox ${operation} forwards its exact payload with the same retry key`, async () => {
    hubReply = { messageId: "301", revision: 2, deliveryId: "77", state: "queued", replayed: false };
    for (let attempt = 0; attempt < 2; attempt++) assert.equal((await post({ operation, payload, requestKey: KEY }, cookie)).status, 200);
    assert.deepEqual(hubCalls, [0, 1].map(() => ({ siteId: "1", operation, payload, requestKey: KEY })));
  });
  test(`inbox ${operation} rejects bad payloads, overrides, missing keys and sessions before Odoo`, async () => {
    for (const bad of [
      { ...payload, messageId: "0" }, { ...payload, messageId: 301 }, { ...payload, expectedRevision: -1 },
      { ...payload, expectedRevision: "1" }, { ...payload, siteId: "99" }, { ...payload, channel: "sms" },
      ...(operation === "approve_reply" ? [{ ...payload, reply: " " }, { ...payload, reply: "x".repeat(1501) }] : []),
      ...(operation === "resolve" ? [{ ...payload, memberId: "abc" }] : []),
    ]) assert.equal((await post({ operation, payload: bad, requestKey: KEY }, cookie)).status, 400, JSON.stringify(bad));
    assert.equal((await post({ operation, payload, requestKey: null }, cookie)).status, 400);
    assert.equal((await post({ operation, payload, requestKey: KEY })).status, 401);
    assert.equal(hubCalls.length, 0);
  });
}

const CLASS_MOVE = { memberId: "3", sessionId: "118", fromSessionId: "117", expectedVersion: 1730000000000 };
const MOVE_TASK = { relatedType: "member", relatedId: "3", summary: "Confirm attendance after a class move", due: "2026-11-03" };
test("change_class and create_task forward their exact payloads and invalidate the member", async () => {
  hubReply = { memberId: "3", sessionId: "118", enrollmentId: "900", state: "registered", replayed: false };
  assert.equal((await post({ operation: "change_class", payload: CLASS_MOVE, requestKey: KEY }, cookie)).status, 200);
  hubReply = { taskId: "77", memberId: "3", replayed: false };
  assert.equal((await post({ operation: "create_task", payload: MOVE_TASK, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls, [
    { siteId: "1", operation: "change_class", payload: CLASS_MOVE, requestKey: KEY },
    { siteId: "1", operation: "create_task", payload: MOVE_TASK, requestKey: KEY },
  ]);
  assert.deepEqual(revalidated, [0, 1].flatMap(() => ["/crm", "/crm/follow-ups", "/front-desk", "/people/3"]));
});
test("change_class and create_task reject bad payloads and overrides before Odoo", async () => {
  for (const bad of [
    { ...CLASS_MOVE, sessionId: "117" }, { ...CLASS_MOVE, expectedVersion: "1" }, { ...CLASS_MOVE, memberId: 3 },
    { ...CLASS_MOVE, siteId: "9" }, { memberId: "3", sessionId: "118", expectedVersion: 1 },
  ]) assert.equal((await post({ operation: "change_class", payload: bad, requestKey: KEY }, cookie)).status, 400, JSON.stringify(bad));
  for (const bad of [
    { ...MOVE_TASK, relatedType: "partner" }, { ...MOVE_TASK, summary: " " }, { ...MOVE_TASK, summary: "x".repeat(201) },
    { ...MOVE_TASK, due: "Nov 3" }, { ...MOVE_TASK, userId: "7" },
  ]) assert.equal((await post({ operation: "create_task", payload: bad, requestKey: KEY }, cookie)).status, 400, JSON.stringify(bad));
  assert.equal((await post({ operation: "change_class", payload: CLASS_MOVE, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: "create_task", payload: MOVE_TASK, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
});

const NEW_LEAD = { name: "Maya Chen - kids karate", contact: "Ana Chen", email: "ana@example.invalid", phone: "+1 555 0100" };
test("create_lead forwards exactly the four fields with the same retry key and invalidates the new lead", async () => {
  for (let attempt = 0; attempt < 2; attempt++) assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: KEY }, cookie)).status, 200);
  assert.deepEqual(hubCalls, [0, 1].map(() => ({ siteId: "1", operation: "create_lead", payload: NEW_LEAD, requestKey: KEY })));
  assert.deepEqual(revalidated, [0, 1].flatMap(() => ["/crm", "/crm/follow-ups", "/front-desk", "/crm/leads/9100"]));
});
test("create_lead rejects bad fields, stage or owner overrides, missing keys and sessions before Odoo", async () => {
  const { phone, ...missingPhone } = NEW_LEAD;
  for (const bad of [
    { ...NEW_LEAD, name: " " }, { ...NEW_LEAD, name: "x".repeat(201) }, { ...NEW_LEAD, email: "not-an-email" },
    { ...NEW_LEAD, phone: 5550100 }, missingPhone, { ...NEW_LEAD, stageId: "4" }, { ...NEW_LEAD, userId: "7" },
    { ...NEW_LEAD, siteId: "99" },
  ]) assert.equal((await post({ operation: "create_lead", payload: bad, requestKey: KEY }, cookie)).status, 400);
  assert.equal(phone.length > 0, true);
  assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: null }, cookie)).status, 400);
  assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: KEY })).status, 401);
  assert.equal(hubCalls.length, 0);
  hubReply = { leadId: "not-an-id", version: 1, replayed: false };
  assert.equal((await post({ operation: "create_lead", payload: NEW_LEAD, requestKey: KEY }, cookie)).status, 200);
  assert.equal(revalidated.length, 0); // an unreadable receipt invalidates nothing
});

test("existing reads still go through with a null request key", async () => {
  const response = await post({ operation: "crm_context", payload: { query: "" }, requestKey: null }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls[0], { siteId: "1", operation: "crm_context", payload: { query: "" }, requestKey: null });
  const keyed = await post({ operation: "context", payload: {}, requestKey: KEY }, cookie);
  assert.equal(keyed.status, 400); // reads never carry a request key
});

// A Perspective is presentation only (src/domain/perspective.ts): it can never
// ride along to Odoo as an extra field, on a read or a write
test("a perspective sent with a request is refused before Odoo", async () => {
  const read = await post({ operation: "context", payload: {}, requestKey: null, perspective: "executive" }, cookie);
  assert.equal(read.status, 400);
  const write = await post(
    { operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY, perspective: "frontDesk" },
    cookie,
  );
  assert.equal(write.status, 400);
  assert.equal(hubCalls.length, 0);
});

test("an action without a sign-in is refused", async () => {
  const response = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY });
  assert.equal(response.status, 401);
  assert.equal(hubCalls.length, 0);
});

test("companion_ask forwards exactly the verified read with null request key", async () => {
  const payload = { question: "Summarize this member.", memberId: "5001", sessionId: null };
  const response = await post({ operation: "companion_ask", payload, requestKey: null }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls, [{ siteId: "1", operation: "companion_ask", payload, requestKey: null }]);
});

test("companion_ask rejects malformed payloads and keyed reads before Odoo", async () => {
  const valid = { question: "Question", memberId: null, sessionId: null };
  for (const payload of [
    { ...valid, leadId: "9" }, { question: "Question" },
    { ...valid, question: " " }, { ...valid, question: " padded " },
    { ...valid, question: "x".repeat(501) }, { ...valid, question: 5 },
    { ...valid, memberId: "not-an-id" }, { ...valid, memberId: 5001 },
    { ...valid, memberId: "5001", sessionId: "6101" },
    { ...valid, sessionId: "0" }, { ...valid, memberId: "1", siteId: "2" },
  ]) {
    const response = await post({ operation: "companion_ask", payload, requestKey: null }, cookie);
    assert.equal(response.status, 400, JSON.stringify(payload));
  }
  assert.equal((await post({ operation: "companion_ask", payload: valid, requestKey: KEY }, cookie)).status, 400);
  assert.equal(hubCalls.length, 0);
});

test("companion_ask still requires a valid sealed staff session", async () => {
  const body = { operation: "companion_ask", payload: { question: "Hi", memberId: null, sessionId: null }, requestKey: null };
  assert.equal((await post(body)).status, 401);
  assert.equal((await post(body, "dojang_hub_session=forged")).status, 401);
  assert.equal(hubCalls.length, 0);
});
