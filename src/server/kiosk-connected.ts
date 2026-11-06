// Adapted from Dojang Companion src/server/odoo-gateway.ts: kiosk paths only.
// Staff remains on the existing authenticated Hub account; no staff pair-key path.
import {randomUUID} from 'node:crypto';
import type {CheckInResult,ProblemCode,ProblemDetails} from '../contracts/kiosk-attendance';
import {kioskAuthorized,kioskConfig,type KioskGatewayConfig as GatewayConfig} from './kiosk-gateway';
type Fetcher=typeof fetch;
const headers={'cache-control':'private, no-store',vary:'Cookie','x-dojang-data-source':'odoo-test'};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const recordId=(v:unknown):v is string=>typeof v==='string'&&/^[1-9][0-9]{0,9}$/.test(v)&&Number(v)<=2147483647;
const key=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{15,127}$/.test(v);
type GatewayCode = ProblemCode | "GUARDIAN_NOT_VERIFIED" | "GUARDIAN_LOCKED" | "GUARDIAN_SESSION_EXPIRED" | "NOT_YOUR_STUDENT";
const codes: GatewayCode[] = ["INVALID_COMMAND", "FORBIDDEN", "SESSION_UNAVAILABLE", "SESSION_NOT_OPEN", "MEMBER_UNAVAILABLE", "NOT_ON_ROSTER", "ELIGIBILITY_REVIEW_REQUIRED", "ATTENDANCE_REVIEW_REQUIRED", "VERSION_CONFLICT", "IDEMPOTENCY_CONFLICT", "CONCURRENT_RETRY", "CAPABILITY_DISABLED", "GUARDIAN_NOT_VERIFIED", "GUARDIAN_LOCKED", "GUARDIAN_SESSION_EXPIRED", "NOT_YOUR_STUDENT"];
const messages: Record<GatewayCode, string> = {
  INVALID_COMMAND: "Invalid request", FORBIDDEN: "This device is not authorized",
  SESSION_UNAVAILABLE: "Session unavailable", SESSION_NOT_OPEN: "Session not open for check-in",
  MEMBER_UNAVAILABLE: "Member unavailable", NOT_ON_ROSTER: "Please see the front desk",
  ELIGIBILITY_REVIEW_REQUIRED: "Please see the front desk", ATTENDANCE_REVIEW_REQUIRED: "Please see the front desk",
  VERSION_CONFLICT: "The session changed. Please select it again", IDEMPOTENCY_CONFLICT: "The request does not match its original attempt",
  CONCURRENT_RETRY: "Please retry the same check-in", CAPABILITY_DISABLED: "The connection is unavailable",
  GUARDIAN_NOT_VERIFIED: "We could not verify that phone number and PIN. Please see the front desk",
  GUARDIAN_LOCKED: "Too many attempts. Please see the front desk", GUARDIAN_SESSION_EXPIRED: "Please verify again",
  NOT_YOUR_STUDENT: "Please see the front desk"
};
const uncertain = (operation: string, correlation: string) => operation === "checkin" || operation === "guardianCheckin"
  ? new Response(null, {status: 503, headers: {...headers, "retry-after": "1"}})
  : fail("CAPABILITY_DISABLED", correlation);
export function fail(code: ProblemCode, correlationId = `gateway-${randomUUID()}`, status = 503): Response {
  const title = code === "FORBIDDEN" ? "This device is not authorized" : code === "INVALID_COMMAND" ? "Invalid request" : "The connection is unavailable. Please retry or contact staff.";
  const value: ProblemDetails = { type: `urn:dojang:problem:${code}`, code, status, title, detail: title, correlationId };
  return Response.json(value, { status, headers: { ...headers, "content-type": "application/problem+json" } });
}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new Error("Body limit"); }
    chunks.push(value);
  }
  const raw = Buffer.concat(chunks).toString();
  return request.headers.get("content-type")?.includes("application/x-www-form-urlencoded") ? Object.fromEntries(new URLSearchParams(raw)) : JSON.parse(raw);
}

const paths = {roster:"/kiosk/v2/session/roster",checkin:"/kiosk/v2/attendance/check-ins",guardianVerify:"/kiosk/v2/guardian/verify",guardianCheckin:"/kiosk/v2/guardian/check-ins"} as const;
export type Operation = keyof typeof paths;

function validCommand(value: unknown): value is Record<string, unknown> {
  if (!object(value) || Object.keys(value).some(k => !["payload", "idempotencyKey", "correlationId", "expectedVersion"].includes(k))) return false;
  const p = value.payload;
  return key(value.idempotencyKey) && key(value.correlationId) && object(p) && Object.keys(p).length === 2 && recordId(p.sessionId) && recordId(p.memberId) && (value.expectedVersion === undefined || (Number.isSafeInteger(value.expectedVersion) && Number(value.expectedVersion) >= 0));
}

function validResult(value: unknown, command: Record<string, unknown>): value is CheckInResult {
  if (!object(value) || !object(value.receipt) || !object(command.payload)) return false;
  const r = value.receipt;
  return value.correlationId === command.correlationId && typeof value.replayed === "boolean" &&
    recordId(r.attendanceId) && r.memberId === command.payload.memberId && r.sessionId === command.payload.sessionId &&
    typeof r.checkedInAt === "string" && /^\d{4}-\d\d-\d\dT.*Z$/.test(r.checkedInAt) && Number.isFinite(Date.parse(r.checkedInAt)) &&
    ["present", "late"].includes(String(r.status)) && typeof r.alreadyRecorded === "boolean" && key(r.correlationId) &&
    (value.replayed === true || r.correlationId === command.correlationId);
}

function publicPayload(operation: Operation, value: Record<string, unknown>): unknown {
  const text = (v: unknown): v is string => typeof v === "string";
  const integer = (v: unknown) => Number.isSafeInteger(v) && Number(v) >= 0;
  const invalid = (): never => { throw new Error("Invalid backend contract"); };
  if (operation === "guardianVerify") {
    if (!text(value.guardianToken) || !/^[A-Za-z0-9_-]{20,128}$/.test(value.guardianToken) || !integer(value.expiresInSeconds) || !text(value.guardian) || !Array.isArray(value.students) || value.students.length>50 || Number(value.expiresInSeconds)<1 || Number(value.expiresInSeconds)>3600 || new Set(value.students.filter(object).map(r=>r.memberId)).size!==value.students.length) return invalid();
    return {guardianToken:value.guardianToken, expiresInSeconds:value.expiresInSeconds, guardian:value.guardian,
      students:value.students.map((m: unknown) => {
        if (!object(m) || !recordId(m.memberId) || !text(m.displayName) || typeof m.onRoster !== "boolean" || (m.attendanceState !== null && !["pending","present","absent","excused"].includes(String(m.attendanceState)))) return invalid();
        return {memberId:m.memberId, displayName:m.displayName, onRoster:m.onRoster, attendanceState:m.attendanceState};
      })};
  }
  if (operation === "checkin" || operation === "guardianCheckin") {
    const r = value.receipt as Record<string, unknown>;
    return { receipt: {attendanceId:r.attendanceId, memberId:r.memberId, sessionId:r.sessionId,
      checkedInAt:r.checkedInAt, status:r.status, alreadyRecorded:r.alreadyRecorded, correlationId:r.correlationId},
      replayed:value.replayed, correlationId:value.correlationId };
  }
  if (operation === "roster") {
    if (!Array.isArray(value.roster) || value.roster.length>500 || new Set(value.roster.filter(object).map(r=>r.memberId)).size!==value.roster.length) return invalid();
    return value.roster.map((m: unknown) => {
      if (!object(m) || !recordId(m.memberId) || !text(m.displayName) || m.enrollmentStatus !== "registered" || !["pending","present","absent","excused"].includes(String(m.attendanceState))) return invalid();
      return {memberId:m.memberId,displayName:m.displayName,enrollmentStatus:m.enrollmentStatus,attendanceState:m.attendanceState};
    });
  }
  return invalid();
}

export async function handle(request: Request, c: GatewayConfig, operation: Operation, id?: string, fetcher: Fetcher = fetch): Promise<Response> {
  if (!kioskAuthorized(c, request.headers.get("cookie") || "")) return fail("FORBIDDEN", undefined, 403);
  let correlation = `gateway-${randomUUID()}`;
  const params: Record<string, unknown> = { token: c.token };
  if (operation === "roster") {
    if (!recordId(id)) return fail("INVALID_COMMAND", correlation, 400);
    params.sessionId = id;
  }
  if (operation === "guardianVerify" || operation === "guardianCheckin") {
    if (request.headers.get("origin") !== c.origin || !request.headers.get("content-type")?.includes("application/json")) return fail("FORBIDDEN", correlation, 403);
    let body;
    try { body = await readBody(request); } catch { return fail("INVALID_COMMAND", correlation, 400); }
    if (!object(body)) return fail("INVALID_COMMAND", correlation, 400);
    if (operation === "guardianVerify") {
      if (Object.keys(body).sort().join() !== "phone,pin,sessionId" || typeof body.phone !== "string" || body.phone.length > 32 ||
        typeof body.pin !== "string" || !/^[0-9]{6}$/.test(body.pin) || !recordId(body.sessionId)) return fail("INVALID_COMMAND", correlation, 400);
      Object.assign(params, {phone: body.phone, pin: body.pin, sessionId: body.sessionId});
    } else {
      if (Object.keys(body).sort().join() !== "command,guardianToken" || typeof body.guardianToken !== "string" ||
        !/^[A-Za-z0-9_-]{20,128}$/.test(body.guardianToken) || !validCommand(body.command)) return fail("INVALID_COMMAND", correlation, 400);
      correlation = body.command.correlationId as string;
      Object.assign(params, {guardianToken: body.guardianToken, command: body.command});
    }
  }
  if (operation === "checkin") {
    if (request.headers.get("origin") !== c.origin || !request.headers.get("content-type")?.includes("application/json")) return fail("FORBIDDEN", correlation, 403);
    let command;
    try { command = await readBody(request); } catch { return fail("INVALID_COMMAND", correlation, 400); }
    if (!validCommand(command)) return fail("INVALID_COMMAND", correlation, 400);
    correlation = command.correlationId as string;
    params.command = command;
  }
  try {
    const response = await fetcher(c.backend + paths[operation], { method: "POST", cache: "no-store", redirect: "error",
      headers: { "content-type": "application/json", "authorization": `Bearer ${c.key}` },
      body: JSON.stringify({ jsonrpc: "2.0", id: correlation, method: "call", params }), signal: AbortSignal.any([request.signal,AbortSignal.timeout(10000)]) });
    if (!response.ok) return uncertain(operation, correlation);
    const envelope: unknown = await response.json();
    if (!object(envelope) || envelope.error || !object(envelope.result)) return uncertain(operation, correlation);
    const result = envelope.result;
    if (object(result.problem)) {
      const p = result.problem;
      if (!codes.includes(p.code as GatewayCode) || typeof p.status !== "number" || p.status < 400 || p.status > 599) return uncertain(operation, correlation);
      const safe = { type: `urn:dojang:problem:${p.code}`, code: p.code, status: p.status,
        title: messages[p.code as GatewayCode], detail: messages[p.code as GatewayCode], correlationId: correlation };
      return Response.json(safe, { status: p.status, headers: { ...headers, "content-type": "application/problem+json" } });
    }
    if (operation === "checkin" && !validResult(result, params.command as Record<string, unknown>)) return uncertain(operation, correlation);
    if (operation === "guardianCheckin" && (result.guardianVerified !== true || !validResult(result, params.command as Record<string, unknown>))) return uncertain(operation, correlation);
    const body = publicPayload(operation, result);
    if (operation === "roster" && !Array.isArray(body)) return fail("CAPABILITY_DISABLED", correlation);
    return Response.json(operation === "guardianCheckin" ? {...(body as Record<string, unknown>), guardianVerified: true} : body, { status: (operation === "checkin" || operation === "guardianCheckin") && !result.replayed && !(result.receipt as { alreadyRecorded?: boolean })?.alreadyRecorded ? 201 : 200, headers });
  } catch { return uncertain(operation, correlation); }
}

export async function connectedKiosk(request:Request,operation:Operation,id?:string){try{return await handle(request,kioskConfig(),operation,id);}catch{return fail('CAPABILITY_DISABLED');}}
