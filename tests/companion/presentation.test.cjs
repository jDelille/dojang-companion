const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const build = process.env.DOJANG_COMPANION_BUILD;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) {
  if (request.startsWith("@/")) request = path.join(build, request.slice(2));
  if (request === "react/jsx-runtime") request = path.join(process.cwd(), "node_modules/react/jsx-runtime");
  return resolve.call(this, request, ...rest);
};
const { default: AgentAnswerContent } = require(path.join(build, "views/doForMe/agentAnswerContent.js"));
const { revealCompanion } = require(path.join(build, "views/doForMe/revealCompanion.js"));
const { memberCompanionContext } = require(path.join(build, "domain/memberCompanion.js"));
const { doForMeActivation } = require(path.join(build, "domain/doForMeActivation.js"));
test("the real answer component renders member scope and safe answer text", () => {
  const html = renderToStaticMarkup(React.createElement(AgentAnswerContent, { turn: { role: "agent", text: "Odoo <script>facts</script>", focus: { kind: "member", id: "5001" } } }));
  assert.match(html, /Member #5001/);
  assert.match(html, /No actions executed/);
  assert.match(html, /Odoo &lt;script&gt;facts&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
test("a site answer is explicitly not a lead/member/message answer", () => {
  const html = renderToStaticMarkup(React.createElement(AgentAnswerContent, { turn: { role: "agent", text: "Site facts", focus: { kind: "site", id: null } } }));
  assert.match(html, /Site-level answer/);
  assert.match(html, /not specific to a lead, message or member/);
});
test("Do For Me reveals the rail and focuses the composer, respecting reduced motion", () => {
  const calls = [];
  global.requestAnimationFrame = (callback) => callback();
  global.window = { matchMedia: () => ({ matches: true }) };
  global.document = { getElementById: (id) => ({ focus: (options) => calls.push([id, "focus", options]), scrollIntoView: (options) => calls.push([id, "scroll", options]) }) };
  revealCompanion(false);
  assert.deepEqual(calls, [["do-for-me-rail", "focus", { preventScroll: true }], ["do-for-me-rail", "scroll", { block: "nearest", behavior: "instant" }], ["companion-question", "focus", { preventScroll: true }]]);
});
test("a governed page review receives focus instead of the chat composer", () => {
  const calls = [];
  global.document = { getElementById: (id) => ({ focus: () => calls.push(id), scrollIntoView: () => {} }) };
  revealCompanion(true);
  assert.deepEqual(calls, ["do-for-me-review"]);
});
test("selected member context has no suggestions that intercept the member AI composer", () => {
  const context = memberCompanionContext({ id: "5001", name: "Test Member", membershipState: "active", rank: { name: "White" } }, { latest: null, history: [], lastSevenDays: { count: 0, complete: false } });
  const next = doForMeActivation(context);
  assert.equal(next.picked, null);
  assert.equal(next.tab, "plan");
  assert.match(context.label, /Test Member/);
  assert.equal(context.intel.find(x => x.label === "Check-ins, last 7 days").value, "Not known exactly");
});
