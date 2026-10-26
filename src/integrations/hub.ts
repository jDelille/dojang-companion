import {
  explainHubError,
  type PrepareLeadActionPayload,
  type PrepareLeadActionResult,
} from "@/domain/hubAction";
import type {
  ApproveReplyPayload,
  ApproveReplyResult,
  DraftPayload,
  DraftResult,
  HubContext,
  ResolvePayload,
  ResolveResult,
} from "@/domain/inbox";

// The only place screens send Hub actions from (browser side). Calls POST /api/hub
// with Companion's body. That route answers from the real Hub (Odoo, read-only,
// after staff sign-in) or from the development fixtures, chosen on the server.

// What a screen does next:
//   done          the Hub saved it (or replayed the earlier save of this key)
//   failed        the Hub said no; nothing changed. A new try uses a new key
//   notConfirmed  no usable answer; it may have saved. Retry with the SAME key
export type HubAnswer<T> =
  | { outcome: "done"; result: T }
  | { outcome: "failed"; code: string }
  | { outcome: "notConfirmed" };

// PROVISIONAL, like Companion's COMPANION_TIMEOUT_SECONDS: how long to wait
const TIMEOUT_SECONDS = 45;

// Codes that mean "busy, try the same request again" (Companion's runHubAction)
const RETRY_SAME_KEY = ["CONCURRENT_RETRY", "BACKEND_UNAVAILABLE", "BACKEND_UNAVAILABLE_RETRY_SAME_ACTION"];

function errorCode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const error = (body as { error?: unknown }).error;
  if (!error || typeof error !== "object") return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

// The Hub's answer must be about this lead and say nothing was sent or booked
function isPreparedFor(body: unknown, leadId: string): body is PrepareLeadActionResult {
  if (!body || typeof body !== "object") return false;
  const result = body as Record<string, unknown>;
  return (
    result.leadId === leadId &&
    typeof result.taskId === "string" &&
    result.state === "prepared" &&
    result.messageSent === false &&
    result.bookingCreated === false &&
    result.membershipCreated === false &&
    typeof result.replayed === "boolean"
  );
}

// Hub operation prepare_lead_action: one internal task on the lead, no message
export async function prepareLeadAction(
  payload: PrepareLeadActionPayload,
  requestKey: string,
): Promise<HubAnswer<PrepareLeadActionResult>> {
  let response: Response;
  let body: unknown;
  try {
    response = await fetch("/api/hub", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operation: "prepare_lead_action", payload, requestKey }),
      signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
    });
    body = await response.json();
  } catch {
    return { outcome: "notConfirmed" };
  }

  if (response.ok && isPreparedFor(body, payload.leadId)) {
    return { outcome: "done", result: body };
  }
  const code = errorCode(body);
  if (code && !RETRY_SAME_KEY.includes(code)) return { outcome: "failed", code };
  return { outcome: "notConfirmed" };
}

// ---------------------------------------------------------------------------
// Inbox (C05)

// Set by the development /api/hub route when outbound is the SIMULATION
// (/api/dev/inbox-scenario). The real Hub never sends it.
const SIMULATED_OUTBOUND_HEADER = "x-dojang-dev-simulated-outbound";

export type InboxContextAnswer =
  | { outcome: "loaded"; context: HubContext; simulatedOutbound: boolean }
  | { outcome: "unavailable"; code: string | null; text: string };

// Codes that mean "sign in first" (the real Hub only)
export const SIGN_IN_CODES = ["SIGN_IN_REQUIRED", "UNAUTHENTICATED"];

const isList = (value: unknown) => Array.isArray(value);

// Hub operation "context" (a read: no request key)
export async function getInboxContext(): Promise<InboxContextAnswer> {
  let response: Response;
  let body: unknown;
  try {
    response = await fetch("/api/hub", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operation: "context", payload: {}, requestKey: null }),
      signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
    });
    body = await response.json();
  } catch {
    return { outcome: "unavailable", code: null, text: "Odoo isn't reachable right now." };
  }

  const context = body as HubContext;
  if (
    !response.ok ||
    !context ||
    !isList(context.messages) ||
    !isList(context.deliveries) ||
    !isList(context.members) ||
    !isList(context.sessions) ||
    !isList(context.timeline) ||
    !context.capabilities
  ) {
    const code = errorCode(body);
    return { outcome: "unavailable", code, text: code ? explainHubError(code) : "The inbox couldn't be loaded." };
  }
  return {
    outcome: "loaded",
    context,
    simulatedOutbound: response.headers.get(SIMULATED_OUTBOUND_HEADER) === "1",
  };
}

// Staff sign-in to the real Hub: the server signs in to Odoo and keeps the
// session in an HttpOnly cookie. Returns null when signed in, else what went wrong.
export async function signInToHub(login: string, password: string): Promise<string | null> {
  try {
    const response = await fetch("/api/hub", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operation: "login", login, password }),
      signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
    });
    if (response.ok) return null;
    const code = errorCode(await response.json());
    return code ? explainHubError(code) : "Sign-in failed.";
  } catch {
    return "Odoo isn't reachable right now.";
  }
}

// Ends the Odoo session and clears the cookie
export async function signOutOfHub(): Promise<void> {
  try {
    await fetch("/api/hub", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operation: "logout" }),
      signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
    });
  } catch {
    // The cookie expires on its own within two hours
  }
}

type InboxWrites = {
  resolve: { payload: ResolvePayload; result: ResolveResult };
  draft: { payload: DraftPayload; result: DraftResult };
  approve_reply: { payload: ApproveReplyPayload; result: ApproveReplyResult };
};

// The Hub's answer must be about the message that was acted on
function isResultFor(operation: keyof InboxWrites, body: unknown, payload: { messageId: string }) {
  if (!body || typeof body !== "object") return false;
  const result = body as Record<string, unknown>;
  if (typeof result.replayed !== "boolean") return false;
  if (operation === "approve_reply") {
    return typeof result.deliveryId === "string" && typeof result.state === "string";
  }
  return result.messageId === payload.messageId && typeof result.revision === "number";
}

// Hub operations resolve / draft / approve_reply
export async function runInboxAction<K extends keyof InboxWrites>(
  operation: K,
  payload: InboxWrites[K]["payload"],
  requestKey: string,
): Promise<HubAnswer<InboxWrites[K]["result"]>> {
  let response: Response;
  let body: unknown;
  try {
    response = await fetch("/api/hub", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operation, payload, requestKey }),
      signal: AbortSignal.timeout(TIMEOUT_SECONDS * 1000),
    });
    body = await response.json();
  } catch {
    return { outcome: "notConfirmed" };
  }

  if (response.ok && isResultFor(operation, body, payload)) {
    return { outcome: "done", result: body as InboxWrites[K]["result"] };
  }
  const code = errorCode(body);
  if (code && !RETRY_SAME_KEY.includes(code)) return { outcome: "failed", code };
  return { outcome: "notConfirmed" };
}
