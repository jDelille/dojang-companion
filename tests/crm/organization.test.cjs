const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { organizeLeads } = require(path.join(process.env.DOJANG_CRM_BUILD, "domain/leadOrganization.js"));
const { attendanceSummary, bookingsSummary } = require(path.join(process.env.DOJANG_CRM_BUILD, "domain/memberReadPresentation.js"));

const base = { owner: "", tag: "", stage: "", source: "", attention: "all", sort: "received" };
const evidence = { priority: "High", openTasks: 0, overdueTasks: 0, dueToday: 0, nextAction: "follow_up", journey: "New" };
const lead = (id, overrides = {}) => ({ id, name: id, owner: "Jamie", stageId: "1", source: "Website", tags: [{ id: "kids", name: "Kids" }], ...overrides });

test("attention filters do not turn missing evidence into no open tasks", () => {
  const leads = [lead("unknown"), lead("needs", { evidence }), lead("won", { evidence: { ...evidence, journey: "Won" } }), lead("lost", { evidence, lostReason: "No interest" }), lead("has-task", { evidence: { ...evidence, openTasks: 1 } })];
  assert.deepEqual(organizeLeads(leads, { ...base, attention: "missing" }).map(x => x.id), ["needs"]);
});
test("filters compose across authoritative stage, owner, tag and source", () => {
  const leads = [lead("match"), lead("other-stage", { stageId: "2" }), lead("other-owner", { owner: "Sam" }), lead("other-source", { source: "Walk-in" }), lead("no-tag", { tags: [] })];
  assert.deepEqual(organizeLeads(leads, { ...base, owner: "Jamie", tag: "kids", stage: "1", source: "Website" }).map(x => x.id), ["match"]);
});
test("priority sorting places unknown evidence last without mutating source order", () => {
  const leads = [lead("unknown"), lead("high", { evidence }), lead("now", { evidence: { ...evidence, priority: "Now" } })];
  assert.deepEqual(organizeLeads(leads, { ...base, sort: "priority" }).map(x => x.id), ["now", "high", "unknown"]);
  assert.deepEqual(leads.map(x => x.id), ["unknown", "high", "now"]);
});
test("due filters use the Hub's recorded counts rather than the browser date", () => {
  const leads = [lead("overdue", { evidence: { ...evidence, overdueTasks: 2 } }), lead("today", { evidence: { ...evidence, dueToday: 1 } }), lead("unknown")];
  assert.deepEqual(organizeLeads(leads, { ...base, attention: "today" }).map(x => x.id), ["today"]);
  assert.deepEqual(organizeLeads(leads, { ...base, attention: "overdue" }).map(x => x.id), ["overdue"]);
});
test("attendance distinguishes exact zero, unknown zero and a lower bound", () => {
  assert.equal(attendanceSummary({ count: 0, complete: true }), "0 check-ins in the last 7 days.");
  assert.match(attendanceSummary({ count: 0, complete: false }), /cannot be counted exactly/);
  assert.match(attendanceSummary({ count: 30, complete: false }), /^At least 30/);
});
test("booking count distinguishes unavailable, confirmed empty and capped empty", () => {
  assert.match(bookingsSummary({}), /unavailable/);
  assert.equal(bookingsSummary({ bookings: [], bookingsCapped: false }), "0 registered sessions.");
  assert.match(bookingsSummary({ bookings: [], bookingsCapped: true }), /total is unknown/);
  assert.match(bookingsSummary({ bookings: [{}], bookingsCapped: true }), /^At least 1/);
});
