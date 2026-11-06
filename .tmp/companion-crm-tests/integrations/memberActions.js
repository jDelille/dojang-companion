"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberOnly = void 0;
exports.memberRead = memberRead;
exports.memberWrite = memberWrite;
const hubAction_1 = require("@/domain/hubAction");
const memberActions_1 = require("@/domain/memberActions");
async function memberRead(operation, payload, signal) {
    try {
        const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation, payload, requestKey: null }), signal });
        const result = await response.json();
        if (!response.ok)
            return { outcome: 'failed', code: (0, memberActions_1.object)(result) && (0, memberActions_1.object)(result.error) && typeof result.error.code === 'string' ? result.error.code : 'BACKEND_UNAVAILABLE' };
        if (!(0, memberActions_1.object)(result))
            return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
        if (operation === 'member_details' && (!(0, memberActions_1.object)(result.member) || result.member.id !== payload.memberId))
            return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
        if (['member_workspace', 'archive_review', 'guardian_kiosk_access', 'consent_overview', 'waiver_context', 'member_onboarding', 'billing_ledger'].includes(operation) && result.memberId !== payload.memberId)
            return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
        if (operation === 'attendance_sheet' && (!(0, memberActions_1.object)(result.session) || result.session.id !== payload.sessionId))
            return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
        return { outcome: 'done', result };
    }
    catch {
        return { outcome: 'failed', code: 'BACKEND_UNAVAILABLE' };
    }
}
async function memberWrite(command, requestKey) {
    if (!(0, hubAction_1.isRequestKey)(requestKey) || !(0, memberActions_1.memberPayloadAllowed)(command.operation, command.payload) || (command.subjectId !== undefined && !(0, memberActions_1.recordId)(command.subjectId)))
        return { outcome: 'failed', code: 'INVALID_COMMAND' };
    try {
        const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation: command.operation, payload: command.payload, requestKey }), signal: AbortSignal.timeout(45000) });
        const value = await response.json();
        if (response.ok)
            return (0, memberActions_1.memberResultAllowed)(command, value) ? { outcome: 'done', result: value } : { outcome: 'notConfirmed' };
        const code = (0, memberActions_1.object)(value) && (0, memberActions_1.object)(value.error) && typeof value.error.code === 'string' ? value.error.code : null;
        return code && !['CONCURRENT_RETRY', 'BACKEND_UNAVAILABLE', 'BACKEND_UNAVAILABLE_RETRY_SAME_ACTION'].includes(code) ? { outcome: 'failed', code } : { outcome: 'notConfirmed' };
    }
    catch {
        return { outcome: 'notConfirmed' };
    }
}
const memberOnly = (p) => Object.keys(p).join() === 'memberId' && (0, memberActions_1.recordId)(p.memberId);
exports.memberOnly = memberOnly;
