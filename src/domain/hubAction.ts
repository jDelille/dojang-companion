// The Hub action contract, for the one write DreamOS uses so far.
//
// Request (same body as Companion's POST /api/hub, which forwards to Odoo's
// POST /companion/hub/action as the signed-in staff member):
//   { operation: "prepare_lead_action", payload: PrepareLeadActionPayload, requestKey }
//
// Shapes copied from Jodi's dojo_companion_hub (16 Oct 2026): service.py _dispatch
// (request keys, replay, errors) and crm.py _prepare_lead_action.

// Odoo's KEY (dojo_kiosk_v2.py): the same key + same request replays the saved
// result; the same key with a different request is IDEMPOTENCY_CONFLICT
const REQUEST_KEY = /^[A-Za-z0-9][A-Za-z0-9_.:-]{15,127}$/;

export const isRequestKey = (value: unknown): value is string =>
  typeof value === "string" && REQUEST_KEY.test(value);

// Made once per attempt. A retry after an unconfirmed result reuses it.
export const newRequestKey = () => `dfm-${crypto.randomUUID()}`;

export type LeadActionKind = "follow_up" | "trial" | "reactivation" | "conversion";

export type PrepareLeadActionPayload = {
  leadId: string;
  expectedVersion: number; // the lead's version when staff opened the review
  kind: LeadActionKind; // Do For Me only uses "follow_up" so far
  reason: string; // 1–800 characters, saved as the task's note
  due: string; // "2026-10-28"
};

// Odoo creates one internal task (mail.activity "Prepare follow-up: <lead>") and
// nothing else: no message, booking, membership or stage change
export type PrepareLeadActionResult = {
  leadId: string;
  taskId: string;
  kind: LeadActionKind;
  state: "prepared";
  messageSent: false;
  bookingCreated: false;
  membershipCreated: false;
  replayed: boolean; // true when this request key was already used for the same request
};

// Every Hub failure: { error: { code, status } }, with the same HTTP status
export type HubError = { error: { code: string; status: number } };

// Staff-facing text for the codes these actions can return (Companion's explainHubError copy)
const MESSAGES: Record<string, string> = {
  GUARDIAN_REVIEW_REQUIRED: "A manager must verify this sender's guardian authority before continuing.",
  NOT_ON_ROSTER: "This student is not registered for that class. Book them first or review the roster.",
  CLASS_REVIEW_REQUIRED: "Confirm the student and class first.",
  ALREADY_APPROVED: "A reply for this message was already approved.",
  PROVIDER_NOT_CONFIGURED: "Messaging is not configured. Your draft remains saved.",
  MESSAGE_UNAVAILABLE: "This message is unavailable with your current access.",
  MEMBER_UNAVAILABLE: "This student is unavailable with your current access.",
  SESSION_UNAVAILABLE: "This class is unavailable with your current access.",
  BACKEND_UNAVAILABLE: "Odoo isn't reachable right now.",
  VERSION_CONFLICT: "This lead changed since you opened it. Reload it and review again.",
  IDEMPOTENCY_CONFLICT: "This request was already used for a different change. Start the review again.",
  LEAD_UNAVAILABLE: "This lead is unavailable with your current access.",
  INVALID_COMMAND: "This action is unavailable or its fields are invalid.",
  FORBIDDEN: "You don't have access to do this.",
  BUSINESS_RULE_REVIEW_REQUIRED: "Odoo could not approve this change.",
  CONCURRENT_RETRY: "Someone else is changing this lead. Try again in a moment.",
  // From the server's Hub connection (src/server/hub-gateway.ts), as in Companion
  BACKEND_UNAVAILABLE_RETRY_SAME_ACTION: "Odoo isn't reachable right now.",
  HUB_NOT_CONFIGURED: "The Odoo connection isn't configured on this server.",
  SIGN_IN_REQUIRED: "Sign in with your Odoo staff account.",
  UNAUTHENTICATED: "Sign in with your Odoo staff account.",
  SIGN_IN_FAILED_OR_MFA_REQUIRED:
    "Sign-in failed. Check the login and password. Accounts that need two-factor sign-in can't sign in here yet.",
  NO_SITE_ACCESS: "This Odoo account has no Companion access for this site.",
  // DreamOS only reads from the real Hub for now
  HUB_READ_ONLY: "DreamOS only reads from Odoo for now. Nothing was changed.",
};

export function explainHubError(code: string) {
  return MESSAGES[code] ?? code.replaceAll("_", " ").toLowerCase();
}
