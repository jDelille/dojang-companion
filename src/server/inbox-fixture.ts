// DEVELOPMENT-ONLY Hub inbox: the "context" and "session_roster" reads and the
// resolve / draft / approve_reply writes, ported from Jodi's dojo_companion_hub (16 Oct 2026):
// service.py _context, _resolve, _draft, _approve_reply, _message, _binding and
// _dispatch (request keys); records.py (message, guardian binding, delivery).
//
// Every person and message here is fictional. No provider (WhatsMax or any other)
// is ever contacted: outbound is "not_configured" unless the development
// scenario turns on SIMULATED outbound, and even then a delivery only moves
// between states when a developer advances it (/api/dev/inbox-scenario).
//
// One store per server process, on globalThis like kiosk-mock.ts. Restarting the
// dev server resets it (or DELETE /api/dev/inbox-scenario).

import type { SessionRoster } from "../domain/arrivals";
import type {
  ApproveReplyResult,
  DeliveryState,
  DraftResult,
  HubContext,
  HubDelivery,
  HubMessage,
  HubTimelineEntry,
  ResolveResult,
} from "../domain/inbox";
import {
  cleanText,
  fail,
  fingerprint,
  hasExactKeys,
  isRecordId,
  isRevision,
  type ActionAnswer,
} from "./hub-fixture-common";
import { devMembers } from "./member-fixture";

// Who "does" development writes: there's no staff sign-in yet. The Hub runs as
// the signed-in Odoo user and needs an owner, manager or instructor grant.
const DEV_STAFF = { userId: "2", name: "Staff (development)", role: "manager", siteId: "1" };

// draft with AI disabled: Jodi's exact template (service.py _draft)
const TEMPLATE_SUMMARY =
  "A verified guardian requested attendance follow-up. Review the original message and the student's class before deciding next steps.";
const TEMPLATE_REPLY =
  "Thank you for letting us know. We will review suitable makeup options and confirm availability and eligibility with you.";
const TEMPLATE_MODE = "Template draft - AI disabled";

// A verified guardian channel (dojo.hub.guardian): who may be replied to, for which children
type GuardianBinding = {
  partnerName: string;
  channel: "sms" | "whatsapp";
  contactRef: string; // the WhatsMax contact id
  memberIds: string[];
  allowReply: boolean;
  version: number;
};

type Session = { id: string; title: string; start: Date; end: Date; memberIds: string[] };

// The message as Odoo stores it; the context read turns it into a HubMessage
type StoredMessage = Omit<HubMessage, "guardianName"> & { bindingContactRef: string | null };

type StoredDelivery = HubDelivery & { body: string; approvedRevision: number };

type SavedAction = { fingerprint: string; messageId: string; result: Record<string, unknown> };

type InboxStore = {
  sessions: Session[];
  messages: StoredMessage[];
  deliveries: StoredDelivery[];
  timeline: HubTimelineEntry[]; // newest first
  savedActions: Record<string, SavedAction>; // request key -> its first result
  simulatedOutbound: boolean;
  nextId: number;
};

const BINDINGS: GuardianBinding[] = [
  { partnerName: "Wei Chen", channel: "whatsapp", contactRef: "301", memberIds: ["5001", "5008"], allowReply: true, version: 1 },
  { partnerName: "Maria Rivera", channel: "sms", contactRef: "302", memberIds: ["5002"], allowReply: true, version: 1 },
];

// Today/tomorrow + hour:minute, server time
function at(dayOffset: number, hour: number, minute: number) {
  const time = new Date();
  time.setDate(time.getDate() + dayOffset);
  time.setHours(hour, minute, 0, 0);
  return time;
}

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

function freshStore(): InboxStore {
  const sessions: Session[] = [
    { id: "6101", title: "Children Advanced", start: at(0, 17, 45), end: at(0, 18, 45), memberIds: ["5001", "5006"] },
    { id: "6102", title: "Children Beginner", start: at(0, 17, 0), end: at(0, 17, 45), memberIds: ["5002"] },
    { id: "6103", title: "Pee Wee", start: at(1, 16, 15), end: at(1, 17, 0), memberIds: ["5003"] },
    { id: "6104", title: "Children Advanced", start: at(1, 17, 45), end: at(1, 18, 45), memberIds: ["5001", "5006"] },
    { id: "6105", title: "Children Beginner", start: at(1, 17, 0), end: at(1, 17, 45), memberIds: ["5002"] },
  ];

  const messages: StoredMessage[] = [
    {
      id: "4004",
      text: "Can Maya come to tomorrow's Children Advanced class instead of tonight's?",
      state: "resolved",
      summary: TEMPLATE_SUMMARY,
      reply: TEMPLATE_REPLY,
      mode: TEMPLATE_MODE,
      revision: 3,
      channel: "whatsapp",
      contactRef: "301",
      bindingContactRef: "301",
      memberId: "5001",
      sessionId: "6101",
    },
    {
      id: "4003",
      text: "Hi, do you have classes for 6 year olds? My son would like to try one.",
      state: "unmatched",
      summary: "",
      reply: "",
      mode: "Not drafted",
      revision: 1,
      channel: "sms",
      contactRef: "399",
      bindingContactRef: null,
      memberId: null,
      sessionId: null,
    },
    {
      id: "4002",
      text: "Alex will be about 15 minutes late to class today, sorry!",
      state: "resolved",
      summary: "",
      reply: "",
      mode: "Not drafted",
      revision: 2,
      channel: "sms",
      contactRef: "302",
      bindingContactRef: "302",
      memberId: "5002",
      sessionId: "6102",
    },
    {
      id: "4001",
      text: "Hi, Maya has a fever so she'll miss class tonight. Could she make it up later this week?",
      state: "received",
      summary: "",
      reply: "",
      mode: "Not drafted",
      revision: 1,
      channel: "whatsapp",
      contactRef: "301",
      bindingContactRef: "301",
      memberId: null,
      sessionId: null,
    },
  ];

  const timeline: HubTimelineEntry[] = [
    { id: "9204", memberId: "5001", sessionId: "6101", action: "draft", actor: "Jamie Ortiz", at: minutesAgo(20), booking: null },
    { id: "9203", memberId: "5001", sessionId: "6101", action: "resolve", actor: "Jamie Ortiz", at: minutesAgo(22), booking: null },
    { id: "9202", memberId: "5002", sessionId: "6102", action: "resolve", actor: "Jamie Ortiz", at: minutesAgo(45), booking: null },
  ];

  return { sessions, messages, deliveries: [], timeline, savedActions: {}, simulatedOutbound: false, nextId: 1 };
}

const serverMemory = globalThis as typeof globalThis & { dojangInboxDev?: InboxStore };

function store(): InboxStore {
  serverMemory.dojangInboxDev ??= freshStore();
  return serverMemory.dojangInboxDev;
}

export function resetDevInbox() {
  serverMemory.dojangInboxDev = freshStore();
}

// ---------------------------------------------------------------------------
// Development controls (/api/dev/inbox-scenario)

export function devInboxOutboundSimulated() {
  return store().simulatedOutbound;
}

export function setDevInboxOutboundSimulated(simulated: boolean) {
  store().simulatedOutbound = simulated;
}

// The moves the Hub's worker and signed callbacks can make (delivery.py).
// No provider reference is ever made up, so providerRef stays null.
const NEXT_STATES: Partial<Record<DeliveryState, DeliveryState[]>> = {
  queued: ["dispatching", "cancelled"],
  dispatching: ["accepted", "uncertain"],
  accepted: ["delivered", "failed"],
  uncertain: ["delivered", "failed"],
};

export function devDeliveries() {
  return store().deliveries.map(({ id, messageId, state }) => ({
    id,
    messageId,
    state,
    next: NEXT_STATES[state] ?? [],
  }));
}

// true when moved; false when that move isn't one the Hub can make
export function advanceDevDelivery(deliveryId: string, to: string): boolean {
  const delivery = store().deliveries.find((each) => each.id === deliveryId);
  if (!delivery) return false;
  const allowed = NEXT_STATES[delivery.state] ?? [];
  if (!allowed.includes(to as DeliveryState)) return false;
  delivery.state = to as DeliveryState;
  return true;
}

// ---------------------------------------------------------------------------
// The Hub

function bindingFor(message: StoredMessage): GuardianBinding | null {
  return BINDINGS.find((b) => b.channel === message.channel && b.contactRef === message.contactRef) ?? null;
}

// _binding(): an active, reply-allowed guardian channel that covers the message's student
function replyBinding(message: StoredMessage): GuardianBinding | null {
  const binding = bindingFor(message);
  if (!binding || !binding.allowReply) return null;
  if (message.memberId && !binding.memberIds.includes(message.memberId)) return null;
  return binding;
}

// context: the inbox read (operation "context", payload {})
export function devInboxContext(payload: unknown): ActionAnswer<HubContext> {
  if (!hasExactKeys(payload, [])) return fail("INVALID_COMMAND", 400);
  const memory = store();
  const now = new Date();

  const messages: HubMessage[] = memory.messages.slice(0, 50).map((message) => {
    const binding = message.bindingContactRef
      ? BINDINGS.find((b) => b.contactRef === message.bindingContactRef)
      : null;
    // The stored message without Odoo's private binding link
    const { bindingContactRef, ...shown } = message;
    void bindingContactRef;
    return { ...shown, guardianName: binding?.partnerName ?? "" };
  });

  const shownIds = messages.map((message) => message.id);

  return {
    status: 200,
    body: {
      principal: DEV_STAFF,
      members: devMembers.map((member) => ({
        id: member.id,
        name: member.name,
        version: 1,
        state: member.membershipState,
        rank: member.rank.name,
      })),
      // Open sessions that haven't ended yet, soonest first
      sessions: memory.sessions
        .filter((session) => session.end > now)
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .map((session) => ({
          id: session.id,
          title: session.title,
          startsAt: session.start.toISOString(),
          future: session.start > now,
          version: 1,
        })),
      messages,
      deliveries: memory.deliveries
        .filter((delivery) => shownIds.includes(delivery.messageId))
        .map(({ id, messageId, state, providerRef, approvedBy, approvedAt }) => ({
          id,
          messageId,
          state,
          providerRef,
          approvedBy,
          approvedAt,
        })),
      timeline: memory.timeline.slice(0, 50),
      capabilities: {
        identity: "odoo_user_session",
        ai: "disabled",
        outbound: memory.simulatedOutbound ? "configured_not_exercised" : "not_configured",
        inbound: "not_configured",
        ebGym: "bridge_not_installed",
        productionReady: false,
      },
    },
  };
}

// session_roster: one sample class's booked members (payload { sessionId }).
// The fixture records no attendance, so everyone is "pending" (not arrived).
export function devSessionRoster(payload: unknown): ActionAnswer<SessionRoster> {
  if (!hasExactKeys(payload, ["sessionId"])) return fail("INVALID_COMMAND", 400);
  const session = store().sessions.find((each) => each.id === payload.sessionId);
  if (!session) return fail("SESSION_UNAVAILABLE", 404);
  const members = devMembers
    .filter((member) => session.memberIds.includes(member.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((member) => ({ id: member.id, name: member.name, rank: member.rank.name, attendance: "pending" }));
  return {
    status: 200,
    body: {
      session: {
        id: session.id,
        name: session.title,
        startsAt: session.start.toISOString(),
        endsAt: session.end.toISOString(),
        instructor: null,
        state: "open",
      },
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      generatedAt: new Date().toISOString(),
      members,
    },
  };
}

function findMessage(id: unknown): StoredMessage | null {
  if (!isRecordId(id)) return null;
  return store().messages.find((message) => message.id === id) ?? null;
}

const hasDelivery = (messageId: string) =>
  store().deliveries.some((delivery) => delivery.messageId === messageId);

// _resolve: confirm the student and class a message is about
function resolve(p: Record<string, unknown>): ActionAnswer<Omit<ResolveResult, "replayed">> {
  if (!hasExactKeys(p, ["messageId", "memberId", "sessionId", "expectedRevision"])) {
    return fail("INVALID_COMMAND", 400);
  }
  const message = findMessage(p.messageId);
  if (!message) return fail("MESSAGE_UNAVAILABLE", 404);
  const member = isRecordId(p.memberId) ? devMembers.find((each) => each.id === p.memberId) : null;
  if (!member) return fail("MEMBER_UNAVAILABLE", 404);
  const session = isRecordId(p.sessionId)
    ? store().sessions.find((each) => each.id === p.sessionId)
    : null;
  if (!session) return fail("SESSION_UNAVAILABLE", 404);

  if (!isRevision(p.expectedRevision) || message.revision !== p.expectedRevision) {
    return fail("VERSION_CONFLICT");
  }
  if (hasDelivery(message.id)) return fail("ALREADY_APPROVED");
  const binding = replyBinding(message);
  if (!binding || !binding.memberIds.includes(member.id)) return fail("GUARDIAN_REVIEW_REQUIRED");
  if (!session.memberIds.includes(member.id)) return fail("NOT_ON_ROSTER");

  message.bindingContactRef = binding.contactRef;
  message.memberId = member.id;
  message.sessionId = session.id;
  message.state = "resolved";
  message.revision += 1;
  message.summary = "";
  message.reply = "";
  message.mode = "Not drafted";

  return {
    status: 200,
    body: { messageId: message.id, memberId: member.id, sessionId: session.id, revision: message.revision },
  };
}

// _message(unresolved=False): the message must already have a student and class
function resolvedMessage(id: unknown): StoredMessage | ActionAnswer<never> {
  const message = findMessage(id);
  if (!message) return fail("MESSAGE_UNAVAILABLE", 404);
  if (!message.memberId || !message.sessionId) return fail("CLASS_REVIEW_REQUIRED");
  return message;
}

const isAnswer = (value: StoredMessage | ActionAnswer<never>): value is ActionAnswer<never> =>
  "status" in value;

// _draft: a reply for staff to review. AI is disabled here, so Jodi's template.
function draft(p: Record<string, unknown>): ActionAnswer<Omit<DraftResult, "replayed">> {
  if (!hasExactKeys(p, ["messageId", "expectedRevision"])) return fail("INVALID_COMMAND", 400);
  const found = resolvedMessage(p.messageId);
  if (isAnswer(found)) return found;
  const message = found;
  if (!replyBinding(message)) return fail("GUARDIAN_REVIEW_REQUIRED");
  if (!isRevision(p.expectedRevision) || message.revision !== p.expectedRevision) {
    return fail("VERSION_CONFLICT");
  }
  if (hasDelivery(message.id)) return fail("ALREADY_APPROVED");

  message.summary = TEMPLATE_SUMMARY;
  message.reply = TEMPLATE_REPLY;
  message.mode = TEMPLATE_MODE;
  message.revision += 1;

  return {
    status: 200,
    body: {
      messageId: message.id,
      memberId: message.memberId ?? "",
      sessionId: message.sessionId ?? "",
      revision: message.revision,
      summary: message.summary,
      reply: message.reply,
      mode: message.mode,
    },
  };
}

// _approve_reply: freeze the reviewed text into a queued delivery
function approveReply(p: Record<string, unknown>): ActionAnswer<Omit<ApproveReplyResult, "replayed">> {
  if (!hasExactKeys(p, ["messageId", "expectedRevision", "reply"])) return fail("INVALID_COMMAND", 400);
  const found = resolvedMessage(p.messageId);
  if (isAnswer(found)) return found;
  const message = found;
  const binding = replyBinding(message);
  if (!binding) return fail("GUARDIAN_REVIEW_REQUIRED");
  if (!isRevision(p.expectedRevision) || message.revision !== p.expectedRevision || !message.reply) {
    return fail("VERSION_CONFLICT");
  }
  if (!store().simulatedOutbound) return fail("PROVIDER_NOT_CONFIGURED", 503);
  const body = cleanText(p.reply, 1500);
  if (!body) return fail("INVALID_COMMAND", 400);

  const memberId = message.memberId ?? "";
  const sessionId = message.sessionId ?? "";
  const existing = store().deliveries.find((delivery) => delivery.messageId === message.id);
  if (existing) {
    if (existing.body !== body || existing.approvedRevision !== message.revision) {
      return fail("ALREADY_APPROVED");
    }
    return { status: 200, body: { deliveryId: existing.id, memberId, sessionId, state: existing.state } };
  }

  const delivery: StoredDelivery = {
    id: String(7100 + store().nextId++),
    messageId: message.id,
    state: "queued",
    providerRef: null,
    approvedBy: DEV_STAFF.name,
    approvedAt: new Date().toISOString(),
    body,
    approvedRevision: message.revision,
  };
  store().deliveries.unshift(delivery);
  return { status: 200, body: { deliveryId: delivery.id, memberId, sessionId, state: "queued" } };
}

const HANDLERS: Record<string, (p: Record<string, unknown>) => ActionAnswer<Record<string, unknown>>> = {
  resolve,
  draft,
  approve_reply: approveReply,
};

export const isInboxWrite = (operation: unknown): operation is string =>
  typeof operation === "string" && operation in HANDLERS;

// _dispatch for the inbox writes: request-key replay, then the handler, then
// the action receipt (it shows in context.timeline)
export function devInboxWrite(
  operation: string,
  payload: unknown,
  requestKey: string,
): ActionAnswer<Record<string, unknown>> {
  const memory = store();
  const digest = fingerprint({ operation, payload });

  const saved = memory.savedActions[requestKey];
  if (saved) {
    if (saved.fingerprint !== digest) return fail("IDEMPOTENCY_CONFLICT");
    if (!findMessage(saved.messageId)) return fail("MESSAGE_UNAVAILABLE", 404);
    return { status: 200, body: { ...saved.result, replayed: true } };
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return fail("INVALID_COMMAND", 400);
  }
  const answer = HANDLERS[operation](payload as Record<string, unknown>);
  if (answer.status !== 200 || !answer.body || "error" in answer.body) return answer;

  const result = answer.body;
  memory.timeline.unshift({
    id: String(9300 + memory.nextId++),
    memberId: String(result.memberId ?? ""),
    sessionId: result.sessionId ? String(result.sessionId) : null,
    action: operation,
    actor: DEV_STAFF.name,
    at: new Date().toISOString(),
    booking: null,
  });
  memory.savedActions[requestKey] = {
    fingerprint: digest,
    messageId: String((payload as Record<string, unknown>).messageId),
    result,
  };
  return { status: 200, body: { ...result, replayed: false } };
}
