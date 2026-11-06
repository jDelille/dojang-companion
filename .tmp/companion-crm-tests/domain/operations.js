"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationsRangeAllowed = operationsRangeAllowed;
exports.operationsReportFrom = operationsReportFrom;
const memberActions_1 = require("./memberActions");
const day = (v) => (0, memberActions_1.string)(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
function operationsRangeAllowed(v) {
    return Object.keys(v).sort().join() === 'fromDate,toDate' && day(v.fromDate) && day(v.toDate) && Date.parse(v.toDate) >= Date.parse(v.fromDate) && Date.parse(v.toDate) - Date.parse(v.fromDate) <= 30 * 86400000;
}
const stamp = (v) => (0, memberActions_1.string)(v) && Number.isFinite(Date.parse(v));
const hours = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const list = (v, check) => Array.isArray(v) && v.length <= 10000 && v.every(r => (0, memberActions_1.object)(r) && check(r));
const unique = (rows, key) => new Set(rows.map(r => r[key])).size === rows.length;
function operationsReportFrom(v, range) {
    if (!(0, memberActions_1.object)(v) || v.fromDate !== range.fromDate || v.toDate !== range.toDate || !(0, memberActions_1.string)(v.timeZone) || !stamp(v.generatedAt) || !(0, memberActions_1.string)(v.scope))
        return null;
    try {
        new Intl.DateTimeFormat('en', { timeZone: v.timeZone });
    }
    catch {
        return null;
    }
    if (!(0, memberActions_1.nonnegative)(v.sessions) || !(0, memberActions_1.nonnegative)(v.unassignedSessions) || v.unassignedSessions > v.sessions
        || !list(v.classes, c => (0, memberActions_1.recordId)(c.id) && (0, memberActions_1.string)(c.name) && stamp(c.startsAt)) || !unique(v.classes, 'id') || v.classes.length !== v.sessions
        || !(0, memberActions_1.object)(v.attendance) || !(0, memberActions_1.nonnegative)(v.attendance.recorded) || !(0, memberActions_1.nonnegative)(v.attendance.attended) || v.attendance.attended > v.attendance.recorded
        || !list(v.attendance.daily, d => day(d.date) && d.date >= range.fromDate && d.date <= range.toDate && (0, memberActions_1.object)(d.counts) && Object.values(d.counts).every(memberActions_1.nonnegative)) || !unique(v.attendance.daily, 'date')
        || !list(v.workload, w => (0, memberActions_1.recordId)(w.id) && (0, memberActions_1.string)(w.name) && (0, memberActions_1.nonnegative)(w.sessions) && hours(w.scheduledHours) && hours(w.closedShiftHours) && (0, memberActions_1.nonnegative)(w.openShifts)) || !unique(v.workload, 'id')
        || !list(v.beltDistribution, b => (0, memberActions_1.string)(b.name) && (0, memberActions_1.nonnegative)(b.members)) || !unique(v.beltDistribution, 'name')
        || !(0, memberActions_1.object)(v.family) || !(0, memberActions_1.nonnegative)(v.family.households) || !(0, memberActions_1.nonnegative)(v.family.membersInHouseholds) || !(0, memberActions_1.nonnegative)(v.family.membersWithoutHousehold))
        return null;
    const daily = v.attendance.daily;
    if (daily.reduce((sum, d) => sum + Object.values(d.counts).reduce((a, b) => a + b, 0), 0) !== v.attendance.recorded
        || daily.reduce((sum, d) => sum + (d.counts.present ?? 0) + (d.counts.late ?? 0), 0) !== v.attendance.attended)
        return null;
    const total = v.family.membersInHouseholds + v.family.membersWithoutHousehold;
    if (v.beltDistribution.reduce((sum, r) => sum + r.members, 0) !== total)
        return null;
    // Project named report fields; raw backend extras never become product facts.
    return { fromDate: range.fromDate, toDate: range.toDate, timeZone: v.timeZone, generatedAt: v.generatedAt, scope: v.scope,
        sessions: v.sessions, unassignedSessions: v.unassignedSessions,
        classes: v.classes.map(c => ({ id: c.id, name: c.name, startsAt: c.startsAt })),
        attendance: { recorded: v.attendance.recorded, attended: v.attendance.attended, daily },
        workload: v.workload.map(w => ({ id: w.id, name: w.name, sessions: w.sessions, scheduledHours: w.scheduledHours, closedShiftHours: w.closedShiftHours, openShifts: w.openShifts })),
        beltDistribution: v.beltDistribution.map(b => ({ name: b.name, members: b.members })),
        family: { households: v.family.households, membersInHouseholds: v.family.membersInHouseholds, membersWithoutHousehold: v.family.membersWithoutHousehold } };
}
