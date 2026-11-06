"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingCatalogFrom = testingCatalogFrom;
exports.memberTestFrom = memberTestFrom;
exports.promotionHistoryFrom = promotionHistoryFrom;
const memberActions_1 = require("./memberActions");
const nullable = (v) => v === null || (0, memberActions_1.string)(v);
const day = (v) => (0, memberActions_1.string)(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
function testingCatalogFrom(v, memberId) {
    if (!(0, memberActions_1.object)(v) || !Array.isArray(v.rows) || v.rows.length > 500 || !Array.isArray(v.ranks) || v.ranks.length > 200 || !Array.isArray(v.tests) || v.tests.length > 50)
        return null;
    const ranks = [], tests = [];
    for (const r of v.ranks) {
        if (!(0, memberActions_1.object)(r) || !(0, memberActions_1.recordId)(r.id) || !(0, memberActions_1.string)(r.name) || typeof r.sequence !== 'number' || !Number.isSafeInteger(r.sequence))
            return null;
        ranks.push({ id: r.id, name: r.name, sequence: r.sequence });
    }
    for (const t of v.tests) {
        if (!(0, memberActions_1.object)(t) || !(0, memberActions_1.recordId)(t.id) || !(0, memberActions_1.string)(t.name) || !day(t.date) || !(0, memberActions_1.string)(t.state) || !(0, memberActions_1.nonnegative)(t.count))
            return null;
        tests.push({ id: t.id, name: t.name, date: t.date, state: t.state, count: t.count });
    }
    if (!v.rows.every(r => (0, memberActions_1.object)(r) && (0, memberActions_1.recordId)(r.memberId)) || new Set(v.rows.map(r => r.memberId)).size !== v.rows.length || new Set(ranks.map(r => r.id)).size !== ranks.length || new Set(tests.map(t => t.id)).size !== tests.length)
        return null;
    const matches = v.rows.filter(r => r.memberId === memberId);
    if (matches.length > 1)
        return null;
    const r = matches[0];
    let openTest = null;
    if (r) {
        if (!(r.openTest === null || ((0, memberActions_1.object)(r.openTest) && (0, memberActions_1.recordId)(r.openTest.testId) && (0, memberActions_1.string)(r.openTest.name))))
            return null;
        openTest = { memberId, openTest: (0, memberActions_1.object)(r.openTest) ? { testId: r.openTest.testId, name: r.openTest.name } : null };
    }
    return { ranks, tests, member: openTest, capped: v.rows.length === 500 || tests.length === 50 };
}
function memberTestFrom(v, testId) {
    if (!(0, memberActions_1.object)(v) || !(0, memberActions_1.object)(v.test) || v.test.id !== testId || !(0, memberActions_1.string)(v.test.name) || !day(v.test.date) || !(0, memberActions_1.string)(v.test.state) || !(0, memberActions_1.nonnegative)(v.test.version) || !(0, memberActions_1.string)(v.school) || !Array.isArray(v.rows) || v.rows.length > 5000)
        return null;
    const result = [];
    for (const r of v.rows) {
        if (!(0, memberActions_1.object)(r) || !(0, memberActions_1.recordId)(r.registrationId) || !(0, memberActions_1.recordId)(r.memberId) || !(0, memberActions_1.string)(r.name) || !nullable(r.currentRank) || !(0, memberActions_1.string)(r.targetRank) || !(0, memberActions_1.string)(r.result) || !['pending', 'pass', 'fail', 'withdrew'].includes(r.result) || !(r.promotionId === null || (0, memberActions_1.recordId)(r.promotionId)))
            return null;
        result.push({ registrationId: r.registrationId, memberId: r.memberId, name: r.name, currentRank: r.currentRank, targetRank: r.targetRank, result: r.result, promotionId: r.promotionId });
    }
    if (new Set(result.map(r => r.registrationId)).size !== result.length || new Set(result.map(r => r.memberId)).size !== result.length)
        return null;
    return { test: { id: testId, name: v.test.name, date: v.test.date, state: v.test.state, version: v.test.version }, rows: result, school: v.school };
}
function promotionHistoryFrom(v, memberId) {
    if (!(0, memberActions_1.object)(v) || !Array.isArray(v.rows) || v.rows.length > 100 || typeof v.more !== 'boolean')
        return null;
    const rows = [];
    for (const r of v.rows) {
        if (!(0, memberActions_1.object)(r) || !(0, memberActions_1.recordId)(r.id) || !(0, memberActions_1.recordId)(r.memberId))
            return null;
        if (r.memberId !== memberId)
            continue;
        if (!(0, memberActions_1.string)(r.rank) || !(0, memberActions_1.nonnegative)(r.stripes) || !day(r.date) || !(0, memberActions_1.nonnegative)(r.memberVersion) || !(0, memberActions_1.string)(r.source) || typeof r.reversed !== 'boolean' || typeof r.latest !== 'boolean' || !nullable(r.reversedBy) || !nullable(r.reversalReason))
            return null;
        rows.push({ id: r.id, memberId, rank: r.rank, stripes: r.stripes, date: r.date, memberVersion: r.memberVersion, source: r.source, reversed: r.reversed, reversedBy: r.reversedBy, reversalReason: r.reversalReason, latest: r.latest });
    }
    return new Set(rows.map(r => r.id)).size === rows.length ? { rows, capped: v.more } : null;
}
