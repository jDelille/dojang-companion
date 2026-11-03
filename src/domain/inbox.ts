// The Hub's inbox read (operation "context") and its three writes, as Jodi's
// dojo_companion_hub defines them (service.py _context, _resolve, _draft,
// _approve_reply; records.py; 16 Oct 2026). Companion reads the same shape
// (app/(companion)/hub/page.tsx).
//
// There are no conversations or threads here: the Hub gives each inbound
// guardian message (synced from WhatsMax) as its own work item.

export type MessageState = "unmatched" | "received" | "resolved";

// One inbound message: dojo.hub.message
export type HubMessage = {
  id: string;
  text: string; // what the sender wrote (1–1500 characters)
  state: MessageState; // unmatched: sender isn't a verified guardian; received: needs class review; resolved: ready for follow-up
  summary: string; // "" until drafted
  reply: string; // the reply draft; "" until drafted
  mode: string; // "Not drafted", "Template draft - AI disabled"…
  revision: number; // send back as expectedRevision on every write
  channel: string; // "sms" or "whatsapp" (the only channels the Hub accepts)
  guardianName: string; // "" when the sender isn't bound to a verified guardian
  contactRef: string; // the WhatsMax contact id
  memberId: string | null;
  sessionId: string | null;
};

// An approved reply in the outbox: dojo.hub.delivery. Only ever changed by the
// dispatch worker and signed provider callbacks, never by a screen.
export type DeliveryState =
  | "queued"
  | "dispatching"
  | "accepted" // the provider took it; NOT confirmation of delivery
  | "delivered"
  | "failed"
  | "uncertain" // may or may not have been sent; never retried automatically
  | "cancelled";

export type HubDelivery = {
  id: string;
  messageId: string;
  state: DeliveryState;
  providerRef: string | null; // the provider's message id, once accepted
  approvedBy: string;
  approvedAt: string | null;
};

export type HubTimelineEntry = {
  id: string;
  memberId: string;
  sessionId: string | null;
  action: string; // the Hub operation, "approve_reply"
  actor: string;
  at: string | null;
  booking: unknown; // only for book/change_class
};

export type HubContext = {
  principal: { userId: string; name: string; role: string; siteId: string };
  members: { id: string; name: string; version: number; state: string; rank: string }[];
  sessions: { id: string; title: string; startsAt: string | null; future: boolean; version: number }[];
  messages: HubMessage[]; // newest first, at most 50
  deliveries: HubDelivery[];
  timeline: HubTimelineEntry[];
  capabilities: {
    identity: string;
    ai: string;
    outbound: "configured_not_exercised" | "not_configured";
    inbound: "configured_not_exercised" | "not_configured";
    ebGym: string;
    productionReady: boolean;
  };
};

// resolve: confirm which student and class a message is about
export type ResolvePayload = {
  messageId: string;
  memberId: string;
  sessionId: string;
  expectedRevision: number;
};
export type ResolveResult = {
  messageId: string;
  memberId: string;
  sessionId: string;
  revision: number;
  replayed: boolean;
};

// draft: prepare a reply for staff to review (template text while AI is off)
export type DraftPayload = { messageId: string; expectedRevision: number };
export type DraftResult = {
  messageId: string;
  memberId: string;
  sessionId: string;
  revision: number;
  summary: string;
  reply: string;
  mode: string;
  replayed: boolean;
};

// approve_reply: put the reviewed reply in the outbox (state "queued")
export type ApproveReplyPayload = { messageId: string; expectedRevision: number; reply: string };
export type ApproveReplyResult = {
  deliveryId: string;
  memberId: string;
  sessionId: string;
  state: DeliveryState;
  replayed: boolean;
};

export const CHANNEL_LABELS: Record<string, string> = { sms: "SMS", whatsapp: "WhatsApp" };

export const MESSAGE_STATE_LABELS: Record<MessageState, string> = {
  unmatched: "Needs guardian verification",
  received: "Needs class review",
  resolved: "Ready for follow-up",
};

export const DELIVERY_LABELS: Record<DeliveryState, string> = {
  queued: "Queued",
  dispatching: "Dispatching",
  accepted: "Accepted by provider, not yet delivered",
  delivered: "Delivered",
  failed: "Failed",
  uncertain: "Uncertain: may or may not have been sent",
  cancelled: "Cancelled before sending",
};

// Exact payloads the gateway forwards for the three Inbox writes (Hub service.py
// _resolve / _draft / _approve_reply); anything else is refused before Odoo.
const isPayloadObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isMessageRecordId = (value: unknown) => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
const isRevision = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export function isResolvePayload(value: unknown): value is ResolvePayload {
  return isPayloadObject(value) && Object.keys(value).sort().join() === "expectedRevision,memberId,messageId,sessionId"
    && isMessageRecordId(value.messageId) && isMessageRecordId(value.memberId) && isMessageRecordId(value.sessionId)
    && isRevision(value.expectedRevision);
}
export function isDraftPayload(value: unknown): value is DraftPayload {
  return isPayloadObject(value) && Object.keys(value).sort().join() === "expectedRevision,messageId"
    && isMessageRecordId(value.messageId) && isRevision(value.expectedRevision);
}
export function isApproveReplyPayload(value: unknown): value is ApproveReplyPayload {
  return isPayloadObject(value) && Object.keys(value).sort().join() === "expectedRevision,messageId,reply"
    && isMessageRecordId(value.messageId) && isRevision(value.expectedRevision)
    && typeof value.reply === "string" && value.reply.trim().length >= 1 && value.reply.length <= 1500;
}
