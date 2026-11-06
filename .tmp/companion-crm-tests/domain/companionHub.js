"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPANION_MODE = void 0;
exports.isCompanionPayload = isCompanionPayload;
exports.companionPayloadFor = companionPayloadFor;
exports.companionAnswerFrom = companionAnswerFrom;
exports.COMPANION_MODE = "AI explanation of scoped Odoo data - no actions executed";
const object = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const recordId = (v) => typeof v === "string" && /^[1-9][0-9]{0,9}$/.test(v);
function isCompanionPayload(value) {
    if (!object(value) || Object.keys(value).sort().join() !== "memberId,question,sessionId")
        return false;
    return typeof value.question === "string" && value.question === value.question.trim()
        && value.question.length >= 1 && value.question.length <= 500
        && (value.memberId === null || recordId(value.memberId))
        && (value.sessionId === null || recordId(value.sessionId))
        && (value.memberId === null || value.sessionId === null);
}
function companionPayloadFor(focusKey, question) {
    if (focusKey.startsWith("lead:") || focusKey.startsWith("sales:")) {
        return { ok: false, code: "LEAD_AI_UNSUPPORTED", status: 409 };
    }
    const memberId = focusKey.startsWith("member:") ? focusKey.slice(7) : null;
    if (memberId === null && !["people", "sales", "inbox", "front-desk", "today", "instructor"].includes(focusKey)) {
        return { ok: false, code: "CONTEXT_UNSUPPORTED", status: 409 };
    }
    const payload = { question: question.trim(), memberId, sessionId: null };
    return isCompanionPayload(payload) ? { ok: true, payload } : { ok: false, code: "INVALID_COMMAND", status: 400 };
}
// Fail closed if Jodi answers for a different record or scope. replayed is ignored.
function companionAnswerFrom(value, payload) {
    if (!object(value) || typeof value.answer !== "string" || !value.answer.trim()
        || value.mode !== exports.COMPANION_MODE || !object(value.focus))
        return null;
    const expected = payload.memberId ? { kind: "member", id: payload.memberId }
        : payload.sessionId ? { kind: "session", id: payload.sessionId } : { kind: "site", id: null };
    if (value.focus.kind !== expected.kind || value.focus.id !== expected.id)
        return null;
    return { answer: value.answer, mode: value.mode, focus: expected };
}
