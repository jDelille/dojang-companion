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
Module._load = function (request, ...rest) {
  if (request === "next/headers") return { cookies: async () => ({ get: () => undefined }) };
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
    complete_task: { taskId: "1", expectedVersion: 1, feedback: "Done" },
    create_task: { relatedType: "lead", relatedId: "1", summary: "Call", due: "2026-10-29" },
    add_lead_note: { leadId: "1", expectedVersion: 1, note: "Hi" },
    assign_lead: { leadId: "1", expectedVersion: 1, ownerId: "2" },
    propose_stage: { leadId: "1", expectedVersion: 1, stageId: "2", reason: "x", due: "2026-10-29" },
    update_lead: { leadId: "1", expectedVersion: 1, changes: { name: "X" } },
    create_lead: { name: "X", contact: "", email: "", phone: "" },
    draft: { messageId: "1", expectedRevision: 0 },
    approve_reply: { messageId: "1", expectedRevision: 1, reply: "Hi" },
    reserve_trial: { leadId: "1" },
  };
  for (const [operation, payload] of Object.entries(writes)) {
    const response = await post({ operation, payload, requestKey: KEY }, cookie);
    assert.equal(response.status, 403, operation);
    assert.equal(await errorOf(response), "HUB_READ_ONLY", operation);
  }
  assert.equal(hubCalls.length, 0);
});

test("existing reads still go through with a null request key", async () => {
  const response = await post({ operation: "crm_context", payload: { query: "" }, requestKey: null }, cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(hubCalls[0], { siteId: "1", operation: "crm_context", payload: { query: "" }, requestKey: null });
  const keyed = await post({ operation: "context", payload: {}, requestKey: KEY }, cookie);
  assert.equal(keyed.status, 400); // reads never carry a request key
});

test("an action without a sign-in is refused", async () => {
  const response = await post({ operation: "prepare_lead_action", payload: PAYLOAD, requestKey: KEY });
  assert.equal(response.status, 401);
  assert.equal(hubCalls.length, 0);
});
