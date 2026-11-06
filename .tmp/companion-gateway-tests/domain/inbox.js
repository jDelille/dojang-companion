"use strict";
// The Hub's inbox read (operation "context") and its three writes, as Jodi's
// dojo_companion_hub defines them (service.py _context, _resolve, _draft,
// _approve_reply; records.py; 16 Oct 2026). Companion reads the same shape
// (app/(companion)/hub/page.tsx).
//
// There are no conversations or threads here: the Hub gives each inbound
// guardian message (synced from WhatsMax) as its own work item.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELIVERY_LABELS = exports.MESSAGE_STATE_LABELS = exports.CHANNEL_LABELS = void 0;
exports.isResolvePayload = isResolvePayload;
exports.isDraftPayload = isDraftPayload;
exports.isApproveReplyPayload = isApproveReplyPayload;
exports.CHANNEL_LABELS = { sms: "SMS", whatsapp: "WhatsApp" };
exports.MESSAGE_STATE_LABELS = {
    unmatched: "Needs guardian verification",
    received: "Needs class review",
    resolved: "Ready for follow-up",
};
exports.DELIVERY_LABELS = {
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
const isPayloadObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const isMessageRecordId = (value) => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
const isRevision = (value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
function isResolvePayload(value) {
    return isPayloadObject(value) && Object.keys(value).sort().join() === "expectedRevision,memberId,messageId,sessionId"
        && isMessageRecordId(value.messageId) && isMessageRecordId(value.memberId) && isMessageRecordId(value.sessionId)
        && isRevision(value.expectedRevision);
}
function isDraftPayload(value) {
    return isPayloadObject(value) && Object.keys(value).sort().join() === "expectedRevision,messageId"
        && isMessageRecordId(value.messageId) && isRevision(value.expectedRevision);
}
function isApproveReplyPayload(value) {
    return isPayloadObject(value) && Object.keys(value).sort().join() === "expectedRevision,messageId,reply"
        && isMessageRecordId(value.messageId) && isRevision(value.expectedRevision)
        && typeof value.reply === "string" && value.reply.trim().length >= 1 && value.reply.length <= 1500;
}
