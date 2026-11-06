"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGN_IN_CODES = void 0;
exports.prepareLeadAction = prepareLeadAction;
exports.getInboxContext = getInboxContext;
exports.getSessionRoster = getSessionRoster;
exports.signInToHub = signInToHub;
exports.signOutOfHub = signOutOfHub;
exports.runInboxAction = runInboxAction;
const inbox_1 = require("@/domain/inbox");
const hubAction_1 = require("@/domain/hubAction");
const inboxWorkspace_1 = require("@/domain/inboxWorkspace");
const hubAction_2 = require("@/domain/hubAction");
// PROVISIONAL, like Companion's COMPANION_TIMEOUT_SECONDS: how long to wait
const TIMEOUT_SECONDS = 45;
// Codes that mean "busy, try the same request again" (Companion's runHubAction)
const RETRY_SAME_KEY = ["CONCURRENT_RETRY", "BACKEND_UNAVAILABLE", "BACKEND_UNAVAILABLE_RETRY_SAME_ACTION"];
function errorCode(body) {
    if (!body || typeof body !== "object")
        return null;
    const error = body.error;
    if (!error || typeof error !== "object")
        return null;
    const code = error.code;
    return typeof code === "string" ? code : null;
}
// The Hub's answer must be about this lead and say nothing was sent or booked
function isPreparedFor(body, leadId) {
    if (!body || typeof body !== "object")
        return false;
    const result = body;
    return (result.leadId === leadId &&
        typeof result.taskId === "string" &&
        result.state === "prepared" &&
        result.messageSent === false &&
        result.bookingCreated === false &&
        result.membershipCreated === false &&
        typeof result.replayed === "boolean");
}
// Hub operation prepare_lead_action: one internal task on the lead, no message
async function prepareLeadAction(payload, requestKey) {
    let response;
    let body;
    try {
        response = await fetch("/api/hub", {
            method: "POST",
            cache: "no-store",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "prepare_lead_action", payload, requestKey }),
            signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
        });
        body = await response.json();
    }
    catch {
        return { outcome: "notConfirmed" };
    }
    if (response.ok && isPreparedFor(body, payload.leadId)) {
        return { outcome: "done", result: body };
    }
    const code = errorCode(body);
    if (code && !RETRY_SAME_KEY.includes(code))
        return { outcome: "failed", code };
    return { outcome: "notConfirmed" };
}
// ---------------------------------------------------------------------------
// Inbox (C05)
// Set by the development /api/hub route when outbound is the SIMULATION
// (/api/dev/inbox-scenario). The real Hub never sends it.
const SIMULATED_OUTBOUND_HEADER = "x-dojang-dev-simulated-outbound";
// Codes that mean "sign in first" (the real Hub only)
exports.SIGN_IN_CODES = ["SIGN_IN_REQUIRED", "UNAUTHENTICATED"];
// Hub operation "context" (a read: no request key)
async function getInboxContext() {
    let response;
    let body;
    try {
        response = await fetch("/api/hub", {
            method: "POST",
            cache: "no-store",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "context", payload: {}, requestKey: null }),
            signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
        });
        body = await response.json();
    }
    catch {
        return { outcome: "unavailable", code: null, text: "Odoo isn't reachable right now." };
    }
    if (!response.ok || !(0, inboxWorkspace_1.isInboxContext)(body)) {
        const code = errorCode(body);
        return { outcome: "unavailable", code, text: code ? (0, hubAction_2.explainHubError)(code) : "The inbox couldn't be loaded." };
    }
    return {
        outcome: "loaded",
        context: body,
        simulatedOutbound: response.headers.get(SIMULATED_OUTBOUND_HEADER) === "1",
    };
}
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string";
function rosterMemberFrom(entry) {
    if (!isObject(entry) || !isText(entry.id) || !isText(entry.name) || !isText(entry.rank) || !isText(entry.attendance)) {
        return null;
    }
    return { id: entry.id, name: entry.name, rank: entry.rank, attendance: entry.attendance };
}
// The whole roster, or null if any part is unreadable (never a shorter list)
function rosterFrom(body) {
    if (!isObject(body) || !isObject(body.session) || !Array.isArray(body.members))
        return null;
    const session = body.session;
    if (!isText(session.id) ||
        !isText(session.name) ||
        !isText(session.startsAt) ||
        !isText(session.endsAt) ||
        !(session.instructor === null || isText(session.instructor)) ||
        !isText(session.state) ||
        !isText(body.timeZone) ||
        !isText(body.generatedAt)) {
        return null;
    }
    const members = [];
    for (const entry of body.members) {
        const member = rosterMemberFrom(entry);
        if (!member)
            return null;
        members.push(member);
    }
    return {
        session: {
            id: session.id,
            name: session.name,
            startsAt: session.startsAt,
            endsAt: session.endsAt,
            instructor: session.instructor,
            state: session.state,
        },
        timeZone: body.timeZone,
        generatedAt: body.generatedAt,
        members,
    };
}
async function getSessionRoster(sessionId) {
    let response;
    let body;
    try {
        response = await fetch("/api/hub", {
            method: "POST",
            cache: "no-store",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "session_roster", payload: { sessionId }, requestKey: null }),
            signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
        });
        body = await response.json();
    }
    catch {
        return { outcome: "unavailable", code: null, text: "Odoo isn't reachable right now." };
    }
    if (!response.ok) {
        const code = errorCode(body);
        return { outcome: "unavailable", code, text: code ? (0, hubAction_2.explainHubError)(code) : "The class roster couldn't be loaded." };
    }
    const roster = rosterFrom(body);
    // Never show another class's roster under this one
    if (!roster || roster.session.id !== sessionId) {
        return { outcome: "unavailable", code: null, text: "Odoo sent a class roster DreamOS can't read." };
    }
    return { outcome: "loaded", roster };
}
// Staff sign-in to the real Hub: the server signs in to Odoo and keeps the
// session in an HttpOnly cookie. Returns null when signed in, else what went wrong.
async function signInToHub(login, password) {
    try {
        const response = await fetch("/api/hub", {
            method: "POST",
            cache: "no-store",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "login", login, password }),
            signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
        });
        if (response.ok)
            return null;
        const code = errorCode(await response.json());
        return code ? (0, hubAction_2.explainHubError)(code) : "Sign-in failed.";
    }
    catch {
        return "Odoo isn't reachable right now.";
    }
}
// Ends the Odoo session and clears the cookie. True only when the server
// confirmed it: { signedOut: true }, or SIGN_IN_REQUIRED (this browser had no
// usable session). Anything else, including no answer, is false: the staff member
// may still be signed in.
async function signOutOfHub() {
    try {
        const response = await fetch("/api/hub", {
            method: "POST",
            cache: "no-store",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "logout" }),
            signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
        });
        const body = await response.json();
        if (response.ok) {
            return !!body && typeof body === "object" && body.signedOut === true;
        }
        return errorCode(body) === "SIGN_IN_REQUIRED";
    }
    catch {
        return false;
    }
}
// The Hub's answer must be about the message that was acted on
function isResultFor(operation, body, payload) {
    if (!body || typeof body !== "object")
        return false;
    const result = body;
    if (typeof result.replayed !== "boolean")
        return false;
    const id = (value) => typeof value === 'string' && /^[1-9][0-9]{0,9}$/.test(value) && Number(value) <= 2147483647;
    if (!id(result.memberId) || !id(result.sessionId))
        return false;
    if (operation === "approve_reply") {
        return id(result.deliveryId) && ['queued', 'dispatching', 'accepted', 'delivered', 'failed', 'uncertain', 'cancelled'].includes(String(result.state));
    }
    if (result.messageId !== payload.messageId || !Number.isSafeInteger(result.revision) || result.revision !== payload.expectedRevision + 1)
        return false;
    if (operation === 'resolve') {
        const target = payload;
        return result.memberId === target.memberId && result.sessionId === target.sessionId;
    }
    return ['summary', 'reply', 'mode'].every(key => typeof result[key] === 'string');
}
// Hub operations resolve / draft / approve_reply
async function runInboxAction(operation, payload, requestKey) {
    const validate = { resolve: inbox_1.isResolvePayload, draft: inbox_1.isDraftPayload, approve_reply: inbox_1.isApproveReplyPayload }[operation];
    if (!validate || !validate(payload) || !(0, hubAction_1.isRequestKey)(requestKey))
        return { outcome: 'failed', code: 'INVALID_COMMAND' };
    let response;
    let body;
    try {
        response = await fetch("/api/hub", {
            method: "POST",
            cache: "no-store",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation, payload, requestKey }),
            signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
        });
        body = await response.json();
    }
    catch {
        return { outcome: "notConfirmed" };
    }
    if (response.ok && isResultFor(operation, body, payload)) {
        return { outcome: "done", result: body };
    }
    const code = errorCode(body);
    if (code && !RETRY_SAME_KEY.includes(code))
        return { outcome: "failed", code };
    return { outcome: "notConfirmed" };
}
