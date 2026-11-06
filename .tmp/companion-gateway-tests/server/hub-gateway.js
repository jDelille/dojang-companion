"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hubEnabled = hubEnabled;
exports.requireHubStaff = requireHubStaff;
exports.readHubAsStaff = readHubAsStaff;
exports.hubRoute = hubRoute;
const companionMigration_1 = require("@/domain/companionMigration");
const operations_1 = require("@/domain/operations");
const node_crypto_1 = require("node:crypto");
const headers_1 = require("next/headers");
const cache_1 = require("next/cache");
const hubAction_1 = require("@/domain/hubAction");
const companionHub_1 = require("@/domain/companionHub");
const memberActions_1 = require("@/domain/memberActions");
const memberWorkspace_1 = require("@/domain/memberWorkspace");
const postTrial_1 = require("@/domain/postTrial");
const trial_1 = require("@/domain/trial");
const studentIntake_1 = require("@/domain/studentIntake");
const trial_2 = require("@/domain/trial");
const inbox_1 = require("@/domain/inbox");
const classMove_1 = require("@/domain/classMove");
const crmWrites_1 = require("@/domain/crmWrites");
const COOKIE_NAME = "dojang_hub_session";
const SESSION_HOURS = 2;
const SESSION_MS = SESSION_HOURS * 60 * 60 * 1000;
const BODY_LIMIT = 16384;
const TIMEOUT_MS = 45000;
// The Hub reads DreamOS forwards. Everything else is refused (see above).
//   context          Inbox, and the People member list
//   member_details   Member 360 (owner, manager or instructor grants only)
//   crm_context      the Sales pipeline (payload exactly { query })
//   lead_details     one lead's record (payload exactly { leadId })
//   session_roster   one class's booked members and their attendance, for Front
//                    Desk arrivals (payload exactly { sessionId }; instructors
//                    only their own classes)
//   ai_settings      owner/manager AI status, model and activation check (payload {})
const FORWARDED_READS = new Set(["context", "member_details", "crm_context", "lead_details", "session_roster", "companion_ask", "ai_settings", 'trial_context', 'intake_context', 'intake_preview']);
const memberReadShape = (p) => Object.keys(p).sort().join() === 'memberId' && (0, memberActions_1.recordId)(p.memberId);
const MEMBER_READS = new Map([
    ['operations_report', operations_1.operationsRangeAllowed],
    ['member_onboarding', memberReadShape], ['billing_ledger', memberReadShape],
    ['refund_preview', p => Object.keys(p).sort().join() === 'invoiceId,memberId' && (0, memberActions_1.recordId)(p.memberId) && (0, memberActions_1.recordId)(p.invoiceId)],
    ['testing_roster', p => Object.keys(p).join() === 'testId' && (0, memberActions_1.recordId)(p.testId)],
    ['promotion_history', p => Object.keys(p).join() === 'query' && typeof p.query === 'string' && p.query.length <= 100],
    ['promotion_preview', p => Object.keys(p).sort().join() === 'registrationIds,testId' && (0, memberActions_1.recordId)(p.testId) && Array.isArray(p.registrationIds) && p.registrationIds.length === 1 && (0, memberActions_1.recordId)(p.registrationIds[0])],
    ['member_workspace', memberWorkspace_1.workspacePayloadAllowed], ['archive_review', memberReadShape], ['guardian_kiosk_access', memberReadShape], ['consent_overview', memberReadShape], ['waiver_context', memberReadShape],
    ['attendance_sessions', p => Object.keys(p).length === 0], ['attendance_sheet', p => Object.keys(p).join() === 'sessionId' && (0, memberActions_1.recordId)(p.sessionId)],
    ['testing_eligibility', p => Object.keys(p).join() === 'query' && typeof p.query === 'string' && p.query.length <= 100],
    ['archived_members', p => Object.keys(p).join() === 'query' && typeof p.query === 'string' && p.query.length <= 100],
    ['course_roster', p => Object.keys(p).join() === 'templateId' && (p.templateId === null || (0, memberActions_1.recordId)(p.templateId))],
    ['course_assignment_preview', p => Object.keys(p).sort().join() === 'addMemberIds,removeMemberIds,templateId' && (0, memberActions_1.recordId)(p.templateId) && Array.isArray(p.addMemberIds) && Array.isArray(p.removeMemberIds) && p.addMemberIds.length + p.removeMemberIds.length === 1 && [...p.addMemberIds, ...p.removeMemberIds].every(memberActions_1.recordId)],
    ...companionMigration_1.MIGRATION_READS.map(op => [op, (p) => (0, companionMigration_1.migrationReadAllowed)(op, p)]),
]);
const isRecordId = (value) => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
// The governed actions (Hub writes) DreamOS forwards, each with the exact payload
// it may carry. Everything else stays refused. Each needs a request key.
//   complete_task         manually completable internal task, task version + feedback
//   add_lead_note         internal-only lead note, lead version; no notifications
//   create_lead           a new lead from Sales: exactly name/contact/email/phone;
//                         the Hub starts it in the intake stage (owner/manager)
//   update_lead           reviewed name/contact/email/phone changes, lead version;
//                         Hub rejects shared-contact edits and enforces staff scope
//   assign_lead           lead version + authorized owner ID; Hub rechecks site grants
//   resolve               Inbox: confirm the student and class a message is about
//   draft                 Inbox: draft a reply for review (AI or the Hub template)
//   approve_reply         Inbox: queue the reviewed reply in the Hub outbox. Odoo
//                         re-checks the approval and sends it through WhatsMax.
//   change_class          Do For Me class move: the booking moves from one class to
//                         another in one Hub transaction (target class version)
//   create_task           an internal follow-up task on a lead or member (owner/manager)
//   prepare_lead_action   Do For Me's lead follow-up: one internal task on the
//                         lead (crm.py _prepare_lead_action). Only kind
//                         "follow_up"; no message, stage, booking or membership.
const FORWARDED_ACTIONS = new Map([
    ["complete_task", crmWrites_1.isCompleteTaskPayload],
    ["add_lead_note", crmWrites_1.isAddLeadNotePayload],
    ["create_lead", crmWrites_1.isCreateLeadPayload],
    ["update_lead", crmWrites_1.isUpdateLeadPayload],
    ['assign_lead', crmWrites_1.isAssignLeadPayload],
    ['reserve_trial', trial_2.isReserveTrialPayload],
    ['record_trial_outcome', trial_1.isTrialAttendancePayload],
    ...memberActions_1.MEMBER_OPERATIONS.filter(op => op !== 'change_class' && op !== 'create_task').map(op => [op, (payload) => (0, memberActions_1.memberPayloadAllowed)(op, payload)]),
    ['propose_stage', postTrial_1.isStageProposalPayload],
    ['create_student', studentIntake_1.isCreateStudentPayload],
    ["resolve", inbox_1.isResolvePayload],
    ["draft", inbox_1.isDraftPayload],
    ["approve_reply", inbox_1.isApproveReplyPayload],
    ["change_class", classMove_1.isChangeClassPayload],
    ["create_task", classMove_1.isCreateTaskPayload],
    [
        "prepare_lead_action",
        (payload) => Object.keys(payload).sort().join() === "due,expectedVersion,kind,leadId,reason" &&
            isRecordId(payload.leadId) &&
            Number.isSafeInteger(payload.expectedVersion) &&
            payload.kind === "follow_up" &&
            typeof payload.reason === "string" &&
            payload.reason.trim().length >= 1 &&
            payload.reason.trim().length <= 800 &&
            typeof payload.due === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(payload.due),
    ],
    ...companionMigration_1.MIGRATION_WRITES.map(op => [op, (p) => (0, companionMigration_1.migrationPayloadAllowed)(op, p)]),
]);
const RESPONSE_HEADERS = { "cache-control": "private, no-store", vary: "Cookie" };
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const problem = (code, status, headers = {}) => Response.json({ error: { code, status } }, { status, headers: { ...RESPONSE_HEADERS, ...headers } });
// Is the real Hub the data source? (The fixtures are used otherwise.)
function hubEnabled() {
    return process.env.DOJANG_HUB_ENABLED === "true";
}
// Only https, or http on this machine; no path, user or query
function isSafeOrigin(url) {
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const schemeOk = url.protocol === "https:" || (url.protocol === "http:" && local);
    return schemeOk && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash;
}
function hubConfig() {
    const env = process.env;
    const origin = new URL(env.DOJANG_PUBLIC_ORIGIN || "");
    const backend = new URL(env.DOJANG_ODOO_URL || "");
    if (!isSafeOrigin(origin) || !isSafeOrigin(backend))
        throw Error("Invalid origin");
    const database = env.DOJANG_ODOO_DATABASE || "";
    const siteId = env.DOJANG_HUB_SITE_ID || "";
    const secret = env.DOJANG_COOKIE_SECRET || "";
    if (!/^[A-Za-z0-9_-]{1,63}$/.test(database))
        throw Error("Invalid database");
    if (!/^[1-9][0-9]{0,9}$/.test(siteId) || Number(siteId) > 2147483647)
        throw Error("Invalid site");
    if (secret.length < 32 || secret.length > 256)
        throw Error("Invalid cookie secret");
    return { origin: origin.origin, backend: backend.origin, database, siteId, secret };
}
// The sealed cookie only works for this app, this Odoo, this database and this site
const scopeOf = (config) => [config.origin, config.backend, config.database, config.siteId];
const keyOf = (config) => (0, node_crypto_1.createHash)("sha256").update("dojang-hub-v1:" + config.secret).digest();
function seal(config, session) {
    const iv = (0, node_crypto_1.randomBytes)(12);
    const cipher = (0, node_crypto_1.createCipheriv)("aes-256-gcm", keyOf(config), iv);
    const data = Buffer.from(JSON.stringify({ session, scope: scopeOf(config), expires: Date.now() + SESSION_MS }));
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
function sessionFrom(config, request) {
    const found = (request.headers.get("cookie") || "")
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part.startsWith(COOKIE_NAME + "="));
    if (found.length !== 1)
        return null;
    return unseal(config, found[0].slice(COOKIE_NAME.length + 1));
}
// The Odoo session inside a sealed cookie value, if it's genuine, current and for this scope
function unseal(config, sealed) {
    if (sealed.length > 2048)
        return null;
    try {
        const data = Buffer.from(sealed, "base64url");
        const decipher = (0, node_crypto_1.createDecipheriv)("aes-256-gcm", keyOf(config), data.subarray(0, 12));
        decipher.setAuthTag(data.subarray(12, 28));
        const value = JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString());
        if (!isObject(value))
            return null;
        const expires = Number(value.expires);
        if (!Number.isSafeInteger(expires) || expires <= Date.now() || expires > Date.now() + SESSION_MS)
            return null;
        if (JSON.stringify(value.scope) !== JSON.stringify(scopeOf(config)))
            return null;
        if (typeof value.session !== "string" || !/^[A-Za-z0-9_-]{32,128}$/.test(value.session))
            return null;
        return value.session;
    }
    catch {
        return null;
    }
}
function sessionCookie(config, value, maxAgeSeconds) {
    const secure = config.origin.startsWith("https:") ? "; Secure" : "";
    return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}
async function readBody(request) {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
        throw Error("Invalid content type");
    const text = await request.text();
    if (text.length > BODY_LIMIT)
        throw Error("Body too large");
    return JSON.parse(text);
}
// Odoo said the session is gone (signed out, expired, or Odoo restarted)
class SessionExpired extends Error {
}
// One JSON-RPC call to Odoo, with the staff member's session if there is one
async function rpc(config, path, params, session) {
    const headers = { "content-type": "application/json" };
    if (session)
        headers.cookie = "session_id=" + session;
    const response = await fetch(config.backend + path, {
        method: "POST",
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", params }),
    });
    if (!response.ok)
        throw Error("Backend unavailable");
    const value = await response.json();
    if (!isObject(value))
        throw Error("Backend rejected request");
    if (value.error) {
        const data = isObject(value.error) && isObject(value.error.data) ? value.error.data : null;
        if (data?.name === "odoo.http.session.SessionExpiredException")
            throw new SessionExpired();
        throw Error("Backend rejected request");
    }
    return { response, result: value.result };
}
// Staff sign-in: { operation: "login", login, password }. The password goes to
// Odoo once and is never stored.
async function signIn(config, data) {
    const { login, password } = data;
    if (Object.keys(data).sort().join() !== "login,operation,password" ||
        typeof login !== "string" || !login.trim() || login.length > 200 ||
        typeof password !== "string" || !password || password.length > 1024) {
        return problem("INVALID_COMMAND", 400);
    }
    try {
        const { response, result } = await rpc(config, "/web/session/authenticate", { db: config.database, login, password }, null);
        const session = /\bsession_id=([A-Za-z0-9_-]{32,128});/.exec(response.headers.get("set-cookie") || "")?.[1];
        if (!isObject(result) || !Number.isSafeInteger(result.uid) || Number(result.uid) <= 0 || !session) {
            return problem("SIGN_IN_FAILED_OR_MFA_REQUIRED", 401);
        }
        // Signed in to Odoo, but is this user allowed on this site? (dojo.hub.grant)
        const context = await rpc(config, "/companion/hub/action", { siteId: config.siteId, operation: "context", payload: {} }, session);
        if (!isObject(context.result) || context.result.error || !isObject(context.result.principal)) {
            return problem("NO_SITE_ACCESS", 403);
        }
        return Response.json(context.result, {
            headers: { ...RESPONSE_HEADERS, "set-cookie": sessionCookie(config, seal(config, session), SESSION_HOURS * 3600) },
        });
    }
    catch {
        return problem("SIGN_IN_FAILED_OR_MFA_REQUIRED", 401);
    }
}
async function signOut(config, session) {
    let backendRevoked = true;
    try {
        await rpc(config, "/web/session/destroy", {}, session);
    }
    catch {
        backendRevoked = false;
    }
    return Response.json({ signedOut: true, backendRevoked }, { headers: { ...RESPONSE_HEADERS, "set-cookie": sessionCookie(config, "", 0) } });
}
// One Hub call as the signed-in staff member, with the configured site: a read
// (requestKey null) or an allowed action (its request key, passed through as is,
// so a retry with the same key replays the Hub's first result). If Odoo doesn't
// answer, an action may still have been saved: BACKEND_UNAVAILABLE tells the
// screen to retry with the same key, never a new one.
async function forward(config, session, operation, payload, requestKey) {
    try {
        const { result } = await rpc(config, "/companion/hub/action", { siteId: config.siteId, operation, payload, requestKey }, session);
        if (!isObject(result))
            throw Error("Invalid result");
        if (isObject(result.error)) {
            const status = [400, 401, 403, 404, 409, 422, 503].includes(Number(result.error.status))
                ? Number(result.error.status)
                : 503;
            const code = typeof result.error.code === "string" && /^[A-Z_]{1,80}$/.test(result.error.code)
                ? result.error.code
                : "BACKEND_UNAVAILABLE";
            return { ok: false, code, status };
        }
        return { ok: true, result };
    }
    catch (error) {
        // Odoo forgot the session (signed out, expired, restarted): sign in again
        if (error instanceof SessionExpired)
            return { ok: false, code: "SIGN_IN_REQUIRED", status: 401 };
        return { ok: false, code: "BACKEND_UNAVAILABLE", status: 503 };
    }
}
// For server components (People, Member 360, Sales, lead records): a Hub read as
// the staff member signed in through /api/hub, from the same sealed cookie. Never
// a fallback.
async function requireHubStaff() {
    if (!hubEnabled())
        return { ok: false, code: "HUB_NOT_CONFIGURED", status: 503 };
    let config;
    try {
        config = hubConfig();
    }
    catch {
        return { ok: false, code: "HUB_NOT_CONFIGURED", status: 503 };
    }
    const cookieStore = await (0, headers_1.cookies)();
    const sealed = cookieStore.get(COOKIE_NAME)?.value;
    const session = sealed ? unseal(config, sealed) : null;
    if (!session)
        return { ok: false, code: "SIGN_IN_REQUIRED", status: 401 };
    return { ok: true, read: (operation, payload) => {
            if (operation === 'trial_context' && !(0, trial_2.isTrialContextPayload)(payload))
                return Promise.resolve({ ok: false, code: 'INVALID_COMMAND', status: 400 });
            if (operation === "ai_settings" && (!isObject(payload) || Object.keys(payload).length !== 0)) {
                return Promise.resolve({ ok: false, code: "INVALID_COMMAND", status: 400 });
            }
            if (operation === "companion_ask" && !(0, companionHub_1.isCompanionPayload)(payload)) {
                return Promise.resolve({ ok: false, code: "INVALID_COMMAND", status: 400 });
            }
            return forward(config, session, operation, payload, null);
        } };
}
async function readHubAsStaff(operation, payload) {
    const staff = await requireHubStaff();
    return staff.ok ? staff.read(operation, payload) : staff;
}
// POST /api/hub when the Hub is the data source
async function hubRoute(request) {
    let config;
    try {
        config = hubConfig();
    }
    catch {
        return problem("HUB_NOT_CONFIGURED", 503);
    }
    if (request.headers.get("origin") !== config.origin)
        return problem("FORBIDDEN", 403, { 'x-dojang-hub-error-stage': 'origin' });
    let data;
    try {
        data = await readBody(request);
    }
    catch {
        return problem("INVALID_COMMAND", 400);
    }
    if (!isObject(data) || typeof data.operation !== "string")
        return problem("INVALID_COMMAND", 400);
    const operation = data.operation;
    if (operation === "login")
        return signIn(config, data);
    const session = sessionFrom(config, request);
    if (!session)
        return problem("SIGN_IN_REQUIRED", 401);
    if (operation === "logout") {
        if (Object.keys(data).join() !== "operation")
            return problem("INVALID_COMMAND", 400);
        return signOut(config, session);
    }
    if (Object.keys(data).sort().join() !== "operation,payload,requestKey" || !isObject(data.payload)) {
        return problem("INVALID_COMMAND", 400);
    }
    let requestKey = null;
    const actionAllows = FORWARDED_ACTIONS.get(operation);
    if (actionAllows) {
        // An allowed action: a request key and exactly its payload, or it never reaches Odoo
        if (!(0, hubAction_1.isRequestKey)(data.requestKey) || !actionAllows(data.payload))
            return problem("INVALID_COMMAND", 400);
        requestKey = data.requestKey;
    }
    else {
        if (!FORWARDED_READS.has(operation) && !MEMBER_READS.has(operation))
            return problem("HUB_READ_ONLY", 403);
        if (MEMBER_READS.has(operation) && !MEMBER_READS.get(operation)(data.payload))
            return problem('INVALID_COMMAND', 400);
        if (data.requestKey !== null)
            return problem("INVALID_COMMAND", 400);
        if (operation === 'trial_context' && !(0, trial_2.isTrialContextPayload)(data.payload))
            return problem('INVALID_COMMAND', 400);
        if (operation === 'intake_context' && !(0, studentIntake_1.isIntakeContextPayload)(data.payload))
            return problem('INVALID_COMMAND', 400);
        if (operation === 'intake_preview' && !(0, studentIntake_1.isIntakePreviewPayload)(data.payload))
            return problem('INVALID_COMMAND', 400);
        if (operation === "ai_settings" && Object.keys(data.payload).length !== 0)
            return problem("INVALID_COMMAND", 400);
        if (operation === "companion_ask" && !(0, companionHub_1.isCompanionPayload)(data.payload))
            return problem("INVALID_COMMAND", 400);
    }
    const backendPayload = operation === 'member_workspace' ? { memberId: data.payload.memberId } : data.payload;
    const answer = await forward(config, session, operation, backendPayload, requestKey);
    if (answer.ok) {
        // Invalidate only after an identity-checked authoritative receipt. Reads
        // remain no-store; the caller also refreshes its current server components.
        const result = answer.result;
        if (operation === 'member_workspace' && (0, memberWorkspace_1.workspacePayloadAllowed)(data.payload)) {
            const projected = (0, memberWorkspace_1.projectWorkspace)(result, data.payload);
            return projected ? Response.json(projected, { headers: RESPONSE_HEADERS }) : problem('HUB_RESPONSE_UNREADABLE', 502);
        }
        if (operation === 'payment_link' && !(0, memberActions_1.paymentUrlAllowed)(result.checkoutUrl, data.payload.invoiceId, config.backend))
            return problem('PAYMENT_URL_NOT_CONFIGURED', 422);
        if (companionMigration_1.MIGRATION_WRITES.includes(operation) && (0, companionMigration_1.migrationResultAllowed)(operation, data.payload, result)) {
            const workflowPayload = data.payload;
            if ((0, memberActions_1.recordId)(result.leadId)) {
                (0, cache_1.revalidatePath)(`/crm/leads/${result.leadId}`);
                (0, cache_1.revalidatePath)('/crm');
            }
            if ((0, memberActions_1.recordId)(result.memberId))
                (0, cache_1.revalidatePath)(`/people/${result.memberId}`);
            for (const candidate of [...(Array.isArray(workflowPayload.addMemberIds) ? workflowPayload.addMemberIds : []), ...(Array.isArray(workflowPayload.removeMemberIds) ? workflowPayload.removeMemberIds : []), ...(Array.isArray(workflowPayload.add) ? workflowPayload.add.filter(isObject).map(r => r.memberId) : []), ...(Array.isArray(result.promotions) ? result.promotions.filter(isObject).map(r => r.memberId) : []), ...(Array.isArray(result.removedMembers) ? result.removedMembers : [])])
                if ((0, memberActions_1.recordId)(candidate))
                    (0, cache_1.revalidatePath)(`/people/${candidate}`);
            (0, cache_1.revalidatePath)('/operations');
            (0, cache_1.revalidatePath)('/instructor');
            (0, cache_1.revalidatePath)('/today');
            (0, cache_1.revalidatePath)('/people');
        }
        const returnedLeadId = result.leadId;
        const returnedMemberId = result.memberId;
        let leadId;
        let memberId;
        if (operation !== 'change_class' && operation !== 'create_task' && memberActions_1.MEMBER_OPERATIONS.includes(operation)) {
            const command = { operation, payload: data.payload };
            if ((0, memberActions_1.memberPayloadAllowed)(command.operation, command.payload) && (0, memberActions_1.memberResultAllowed)(command, result)) {
                memberId = (0, memberActions_1.commandMember)(command) ?? undefined;
                if (!memberId && (0, memberActions_1.recordId)(result.memberId))
                    memberId = result.memberId;
                if (Array.isArray(result.promotions))
                    for (const row of result.promotions)
                        if (isObject(row) && (0, memberActions_1.recordId)(row.memberId))
                            (0, cache_1.revalidatePath)(`/people/${row.memberId}`);
                (0, cache_1.revalidatePath)('/people');
                (0, cache_1.revalidatePath)('/instructor');
                (0, cache_1.revalidatePath)('/today');
            }
        }
        if (operation === 'propose_stage' && (0, postTrial_1.isStageProposalPayload)(data.payload) && (0, postTrial_1.isStageProposalResult)(result, data.payload))
            leadId = data.payload.leadId;
        if (operation === 'record_trial_outcome' && (0, trial_1.isTrialAttendancePayload)(data.payload) && (0, trial_1.isTrialAttendanceResult)(result, data.payload)) {
            leadId = result.leadId;
            memberId = result.memberId;
            (0, cache_1.revalidatePath)('/instructor');
            (0, cache_1.revalidatePath)('/today');
        }
        if (operation === 'create_student' && (0, studentIntake_1.isCreateStudentPayload)(data.payload) && (0, studentIntake_1.isStudentReceipt)(result, data.payload)) {
            memberId = result.memberId;
            (0, cache_1.revalidatePath)('/people');
        }
        if (operation === 'reserve_trial' && (0, trial_2.isReserveTrialPayload)(data.payload) && (0, trial_2.isReservedTrialResult)(result, data.payload)) {
            leadId = data.payload.leadId;
            memberId = data.payload.memberId;
            (0, cache_1.revalidatePath)('/instructor');
            (0, cache_1.revalidatePath)('/today');
        }
        if (operation === "add_lead_note" && (0, crmWrites_1.isAddLeadNotePayload)(data.payload) && (0, crmWrites_1.isSavedLeadNoteResult)(result, data.payload.leadId))
            leadId = data.payload.leadId;
        if (operation === "create_lead" && (0, crmWrites_1.isCreatedLeadResult)(result))
            leadId = result.leadId;
        if (operation === 'update_lead' && (0, crmWrites_1.isUpdateLeadPayload)(data.payload) && (0, crmWrites_1.isUpdatedLeadResult)(result, data.payload))
            leadId = data.payload.leadId;
        if (operation === 'assign_lead' && (0, crmWrites_1.isAssignLeadPayload)(data.payload) && (0, crmWrites_1.isAssignedLeadResult)(result, data.payload))
            leadId = data.payload.leadId;
        if (operation === "change_class" && (0, classMove_1.isChangeClassPayload)(data.payload) && (0, classMove_1.isChangedClassResult)(result, data.payload))
            memberId = data.payload.memberId;
        if (operation === "create_task" && (0, classMove_1.isCreateTaskPayload)(data.payload) && (0, classMove_1.isCreatedTaskResult)(result, data.payload)) {
            if (data.payload.relatedType === "lead")
                leadId = data.payload.relatedId;
            else
                memberId = data.payload.relatedId;
        }
        if (operation === "complete_task" && (0, crmWrites_1.isCompleteTaskPayload)(data.payload)) {
            if (isRecordId(returnedLeadId) && (0, crmWrites_1.isCompletedTaskResult)(result, data.payload.taskId, { kind: "lead", id: returnedLeadId }))
                leadId = returnedLeadId;
            if (isRecordId(returnedMemberId) && (0, crmWrites_1.isCompletedTaskResult)(result, data.payload.taskId, { kind: "member", id: returnedMemberId }))
                memberId = returnedMemberId;
        }
        if (leadId || memberId) {
            (0, cache_1.revalidatePath)("/crm");
            (0, cache_1.revalidatePath)("/crm/follow-ups");
            (0, cache_1.revalidatePath)("/front-desk");
            if (leadId)
                (0, cache_1.revalidatePath)(`/crm/leads/${leadId}`);
            if (memberId)
                (0, cache_1.revalidatePath)(`/people/${memberId}`);
        }
        return Response.json(result, { headers: RESPONSE_HEADERS });
    }
    // A session Odoo no longer knows: also drop the stale cookie
    const clear = answer.code === "SIGN_IN_REQUIRED" ? { "set-cookie": sessionCookie(config, "", 0) } : {};
    return problem(answer.code, answer.status, { ...clear, 'x-dojang-hub-error-stage': 'backend' });
}
