"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIGRATION_AUTH_LOST = void 0;
exports.workflowFetch = workflowFetch;
const companionMigration_1 = require("@/domain/companionMigration");
const operations_1 = require("@/domain/operations");
const memberActions_1 = require("@/domain/memberActions");
exports.MIGRATION_AUTH_LOST = 'dojang-migration-auth-lost';
// Adapted screens use the same BFF. Reject unreadable snapshots before any screen
// can turn missing fields into zero; this never substitutes development records.
async function workflowFetch(input, init) {
    const body = JSON.parse(String(init?.body));
    const signal = AbortSignal.any([...(init?.signal ? [init.signal] : []), AbortSignal.timeout(45000)]);
    const response = await globalThis.fetch(input, { ...init, signal });
    const v = await response.clone().json();
    if (!response.ok) {
        if ((0, memberActions_1.object)(v) && (0, memberActions_1.object)(v.error) && ['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(String(v.error.code)))
            window.dispatchEvent(new Event(exports.MIGRATION_AUTH_LOST));
        return response;
    }
    const op = body.operation, p = body.payload;
    let valid = (0, companionMigration_1.migrationReadResultAllowed)(op, p, v);
    if (op === 'operations_report')
        valid = (0, operations_1.operationsReportFrom)(v, p) !== null;
    if (op === 'session_roster')
        valid = (0, memberActions_1.object)(v) && (0, memberActions_1.object)(v.session) && v.session.id === p.sessionId && (0, memberActions_1.string)(v.session.name) && (0, memberActions_1.string)(v.session.startsAt) && (0, memberActions_1.string)(v.session.endsAt) && (0, memberActions_1.string)(v.session.state) && (v.session.instructor === null || (0, memberActions_1.string)(v.session.instructor)) && (0, memberActions_1.string)(v.timeZone) && (0, memberActions_1.string)(v.generatedAt) && Array.isArray(v.members) && v.members.length <= 500 && v.members.every(m => (0, memberActions_1.object)(m) && (0, memberActions_1.recordId)(m.id) && (0, memberActions_1.string)(m.name) && (0, memberActions_1.string)(m.rank) && (0, memberActions_1.string)(m.attendance));
    if (!valid)
        throw Error('HUB_RESPONSE_UNREADABLE');
    return response;
}
