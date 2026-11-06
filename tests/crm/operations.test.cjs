const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_CRM_BUILD;
const original = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) { return original.call(this, request.startsWith('@/') ? path.join(build, request.slice(2)) : request, ...rest); };
const { operationsRangeAllowed, operationsReportFrom } = require(path.join(build, 'domain/operations.js'));
const { decisionCount, deliveryProblems } = require(path.join(build, 'domain/today.js'));
const range = { fromDate: '2026-11-01', toDate: '2026-11-04' };
const report = () => ({ ...range, timeZone: 'America/Phoenix', generatedAt: '2026-11-04T18:00:00Z', scope: 'Company; class start dates', sessions: 1, classes: [{ id: '7', name: 'Kids', startsAt: '2026-11-04T18:00:00Z' }], attendance: { recorded: 2, attended: 1, daily: [{ date: '2026-11-04', counts: { present: 1, excused: 1 } }] }, workload: [{ id: '2', name: 'Instructor', sessions: 1, scheduledHours: 1, closedShiftHours: 0, openShifts: 1 }], unassignedSessions: 0, beltDistribution: [{ name: 'White', members: 2 }], family: { households: 1, membersInHouseholds: 2, membersWithoutHousehold: 0 } });
test('operations range allows at most 31 inclusive calendar days with no scope overrides', () => {
 assert.equal(operationsRangeAllowed(range), true);
 assert.equal(operationsRangeAllowed({ fromDate: '2026-01-01', toDate: '2026-01-31' }), true);
 for (const p of [{ fromDate: '2026-01-01', toDate: '2026-02-01' }, { fromDate: '2026-02-30', toDate: '2026-03-01' }, { fromDate: '2026-11-04', toDate: '2026-11-01' }, { ...range, siteId: '2' }]) assert.equal(operationsRangeAllowed(p), false);
});
test('operations report keeps attendance outcomes, shift hours and current snapshot separate', () => {
 const raw = report(); raw.secret = 'omit'; const parsed = operationsReportFrom(raw, range);
 assert.equal(parsed.sessions, 1); assert.equal(parsed.attendance.attended, 1); assert.equal(parsed.workload[0].openShifts, 1);
 assert.equal('secret' in parsed, false); assert.equal('attendancePercentage' in parsed, false); assert.equal('revenue' in parsed, false);
});
test('wrong dates, duplicate identities and inconsistent aggregates reject the entire report', () => {
 for (const change of [r => r.toDate = '2026-11-05', r => r.timeZone = 'bad-zone', r => r.classes.push(r.classes[0]), r => r.attendance.recorded = 3, r => r.attendance.attended = 2, r => r.family.membersWithoutHousehold = 2, r => r.unassignedSessions = 2, r => r.workload[0].scheduledHours = NaN, r => r.attendance.daily[0].date = '2026-12-01']) { const raw = report(); change(raw); assert.equal(operationsReportFrom(raw, range), null); }
});
test('a confirmed empty report stays distinct from malformed data', () => {
 const raw = report(); Object.assign(raw, { sessions: 0, classes: [], attendance: { recorded: 0, attended: 0, daily: [] }, workload: [], beltDistribution: [], family: { households: 0, membersInHouseholds: 0, membersWithoutHousehold: 0 } });
 assert.equal(operationsReportFrom(raw, range).sessions, 0); delete raw.attendance; assert.equal(operationsReportFrom(raw, range), null);
});
test('decision summary marks unavailable sources as partial and includes cancelled deliveries', () => {
 const work = { coverage: null, rostersPending: false, messages: null, deliveries: null, due: null, noNextAction: null, crmExpected: true };
 assert.deepEqual(decisionCount(work), { count: 0, partial: true });
 const result = deliveryProblems({ messages: [{ id: '1' }], deliveries: [{ id: '2', messageId: '1', state: 'cancelled' }] }); assert.equal(result.problems.length, 1);
});
