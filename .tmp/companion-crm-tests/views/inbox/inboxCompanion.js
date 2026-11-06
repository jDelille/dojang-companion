"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.senderName = exports.sessionOf = exports.memberName = exports.REVIEW_REPLY_CAPABILITY = exports.PREPARE_REPLY_CAPABILITY = void 0;
exports.outboundLabel = outboundLabel;
exports.deliveryOf = deliveryOf;
exports.needsStaff = needsStaff;
exports.deliveryMeaning = deliveryMeaning;
exports.inboxRailContext = inboxRailContext;
exports.messageRailContext = messageRailContext;
const inbox_1 = require("@/domain/inbox");
/*
   What the shared Do For Me rail shows on the Inbox (focus "inbox") and on one
   message (focus "message:<id>"). Built only from the Hub's inbox read: there's
   no Companion AI context for messages yet, so nothing here is an AI decision.
   PROPOSED (DreamOS) wording and rules, from the C05 audit.
*/
exports.PREPARE_REPLY_CAPABILITY = "hub.message.draft";
exports.REVIEW_REPLY_CAPABILITY = "hub.message.approve_reply";
const RECORDED_ELSEWHERE = new Set(["delivered", "failed", "cancelled"]);
function outboundLabel(context, simulated) {
    if (context.capabilities.outbound === "not_configured")
        return "Not configured";
    return simulated ? "Simulated (development, no provider)" : "Configured, not exercised";
}
function deliveryOf(context, messageId) {
    return context.deliveries.find((delivery) => delivery.messageId === messageId) ?? null;
}
// Staff must act next: verify, resolve, draft or review. Replied messages aren't
function needsStaff(context, message) {
    return !deliveryOf(context, message.id);
}
const memberName = (context, memberId) => memberId ? (context.members.find((member) => member.id === memberId)?.name ?? `Student #${memberId}`) : null;
exports.memberName = memberName;
const sessionOf = (context, sessionId) => sessionId ? (context.sessions.find((session) => session.id === sessionId) ?? null) : null;
exports.sessionOf = sessionOf;
const senderName = (message) => message.guardianName || "Unverified sender";
exports.senderName = senderName;
// What a delivery state means, without overstating it
function deliveryMeaning(delivery) {
    switch (delivery.state) {
        case "queued":
            return "Approved and waiting in the Hub's outbox. Not sent yet.";
        case "dispatching":
            return "The Hub's worker has started sending it. Not confirmed yet.";
        case "accepted":
            return "The provider accepted it. That is not confirmation that it was delivered.";
        case "delivered":
            return "The provider reported it delivered.";
        case "failed":
            return "The provider reported that it failed.";
        case "uncertain":
            return "It may or may not have been sent. The Hub never retries this automatically, and there's no way to settle it here yet.";
        case "cancelled":
            return "Cancelled before sending (the approval no longer held when the outbox checked it).";
    }
}
function inboxRailContext(context, simulated) {
    const count = (state) => context.messages.filter((message) => message.state === state && !deliveryOf(context, message.id)).length;
    const inOutbox = context.deliveries.filter((delivery) => !RECORDED_ELSEWHERE.has(delivery.state)).length;
    const receipts = context.timeline
        .filter((entry) => ["resolve", "draft", "approve_reply"].includes(entry.action))
        .slice(0, 10)
        .map((entry) => ({
        id: entry.id,
        suggestionId: "",
        summary: `${entry.action.replaceAll("_", " ")} · ${(0, exports.memberName)(context, entry.memberId) ?? "message"}`,
        actor: entry.actor,
        at: entry.at ?? "",
    }));
    return {
        label: "Inbox context",
        intelTitle: "Inbox",
        intel: [
            { label: "Needs guardian verification", value: String(count("unmatched")) },
            { label: "Needs class review", value: String(count("received")) },
            { label: "Ready for follow-up", value: String(count("resolved")) },
            { label: "Replies in the outbox", value: String(inOutbox) },
            { label: "Outbound", value: outboundLabel(context, simulated) },
        ],
        suggestions: [],
        receipts,
    };
}
function messageRailContext(context, message, simulated) {
    const delivery = deliveryOf(context, message.id);
    const student = (0, exports.memberName)(context, message.memberId);
    const session = (0, exports.sessionOf)(context, message.sessionId);
    const className = session ? session.title : message.sessionId ? `Class #${message.sessionId}` : null;
    const channel = inbox_1.CHANNEL_LABELS[message.channel] ?? message.channel;
    const intel = [
        { label: "Sender", value: (0, exports.senderName)(message) },
        { label: "Channel", value: channel },
        { label: "Student", value: student ?? "Not confirmed" },
        { label: "Class", value: className ?? "Not confirmed" },
        { label: "State", value: inbox_1.MESSAGE_STATE_LABELS[message.state] },
    ];
    if (delivery) {
        intel.push({
            label: "Delivery",
            value: `${inbox_1.DELIVERY_LABELS[delivery.state]}${simulated ? " (simulated)" : ""}`,
        });
    }
    // History: this message's approval. (The Hub's audit entries carry the student
    // and class but no message id, so they aren't attributed to one message.)
    const receipts = delivery
        ? [
            {
                id: delivery.id,
                suggestionId: `inbox-review:${message.id}`,
                summary: `Reply approved and queued · now ${inbox_1.DELIVERY_LABELS[delivery.state].toLowerCase()}${simulated ? " (simulated)" : ""}`,
                actor: delivery.approvedBy,
                at: delivery.approvedAt ?? "",
            },
        ]
        : [];
    const base = {
        label: `Message · ${(0, exports.senderName)(message)}`,
        intelTitle: "Message",
        intel,
        suggestions: [],
        receipts,
    };
    if (delivery) {
        return { ...base, guidance: deliveryMeaning(delivery) };
    }
    if (message.state === "unmatched") {
        return {
            ...base,
            guidance: "Guardian verification is required. A manager can verify the channel on the correct student profile. Then confirm the student and registered class here; Odoo rechecks the verified binding before resolving. Selecting a student alone does not verify the sender.",
        };
    }
    if (message.state === "received") {
        return {
            ...base,
            guidance: "Confirm the student and class on the page. Do For Me doesn't choose them for you.",
        };
    }
    const evidence = [
        { label: "Sender", value: (0, exports.senderName)(message) },
        { label: "Student", value: student ?? "Not confirmed" },
        { label: "Class", value: className ?? "Not confirmed" },
        { label: "Drafting", value: context.capabilities.ai === "disabled" ? "AI disabled: Hub template" : "Configured AI" },
    ];
    if (!message.reply) {
        const suggestion = {
            id: `inbox-prepare:${message.id}`,
            title: "Prepare a follow-up reply",
            explanation: `${(0, exports.senderName)(message)} wrote about ${student ?? "a student"}${className ? ` (${className})` : ""}. The Hub can prepare a draft reply for staff to review. Nothing is sent: approving a reply is a separate step.`,
            actionLabel: "Prepare follow-up",
            capability: exports.PREPARE_REPLY_CAPABILITY,
            risk: "low",
            review: "page",
            preview: [
                { label: "Creates", value: "A reply draft on this message" },
                { label: "Message", value: "None sent" },
            ],
            evidence,
        };
        return { ...base, featured: { suggestion, summary: "A draft reply can be prepared for review." } };
    }
    const suggestion = {
        id: `inbox-review:${message.id}`,
        title: "Review the drafted reply",
        explanation: message.summary || "A reply is drafted and waiting for staff review.",
        actionLabel: "Review reply",
        capability: exports.REVIEW_REPLY_CAPABILITY,
        risk: "medium",
        review: "page",
        preview: [
            { label: "Approving", value: "Puts the reviewed reply in the Hub's outbox" },
            { label: "Outbound", value: outboundLabel(context, simulated) },
        ],
        evidence: [
            ...evidence,
            { label: "Draft mode", value: message.mode },
            { label: "Recipient", value: (0, exports.senderName)(message) },
            { label: "Channel", value: `${channel} · contact ${message.contactRef}` },
            { label: "Outbound", value: outboundLabel(context, simulated) },
        ],
    };
    return { ...base, featured: { suggestion, summary: "Review and edit the reply on the page." } };
}
