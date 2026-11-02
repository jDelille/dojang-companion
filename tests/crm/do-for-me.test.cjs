const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { doForMeActivation } = require(path.join(process.env.DOJANG_CRM_BUILD, "domain/doForMeActivation.js"));
const context = { label: "Member context", intelTitle: "Member", intel: [{ label: "Membership", value: "Active" }], suggestions: [], receipts: [] };

test("a read-only record opens a visible summary without fabricating an action", () => {
  const result = doForMeActivation(context);
  assert.equal(result.tab, "plan");
  assert.equal(result.picked, null);
  assert.equal(result.summary, "Membership: Active");
  assert.match(result.message, /Ask Companion/);
});
test("a page-reviewed follow-up opens its evidence and retains the exact proposal", () => {
  const suggestion = { id: "follow-up", review: "page" };
  const result = doForMeActivation({ ...context, featured: { suggestion }, suggestions: [{ id: "other" }] });
  assert.equal(result.picked, suggestion);
  assert.equal(result.tab, "evidence");
  assert.match(result.message, /Nothing has been executed/);
});
test("an unsupported proposal opens review without claiming it can execute", () => {
  const suggestion = { id: "unconnected" };
  const result = doForMeActivation({ ...context, suggestions: [suggestion] });
  assert.equal(result.tab, "work");
  assert.match(result.message, /Execution availability/);
});
test("linked task context points to records instead of inventing recommendations", () => {
  const result = doForMeActivation({ ...context, links: [{ id: "1", title: "Open task", href: "/crm/leads/1" }] });
  assert.equal(result.picked, null);
  assert.match(result.message, /Choose a linked record/);
});
