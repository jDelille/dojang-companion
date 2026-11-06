"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberMessagesFrom = memberMessagesFrom;
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const deliveryStates = ['queued', 'dispatching', 'accepted', 'delivered', 'failed', 'uncertain', 'cancelled'];
function memberMessagesFrom(value, memberId) {
    if (!id(memberId) || !obj(value) || !Array.isArray(value.members) || !value.members.some(m => obj(m) && m.id === memberId)
        || !Array.isArray(value.messages) || value.messages.length > 50 || !Array.isArray(value.deliveries) || value.deliveries.length > 100)
        return null;
    const seen = new Set(), deliveryIds = new Set();
    const rows = [];
    for (const m of value.messages) {
        if (!obj(m) || !id(m.id) || seen.has(m.id) || !(m.memberId === null || id(m.memberId)) || typeof m.text !== 'string' || typeof m.channel !== 'string' || typeof m.guardianName !== 'string'
            || typeof m.state !== 'string' || !['unmatched', 'received', 'resolved'].includes(m.state))
            return null;
        seen.add(m.id);
        if (m.memberId === memberId)
            rows.push({ id: m.id, text: m.text, channel: m.channel, guardianName: m.guardianName, state: m.state, deliveries: [] });
    }
    for (const d of value.deliveries) {
        if (!obj(d) || !id(d.id) || deliveryIds.has(d.id) || !id(d.messageId) || !seen.has(d.messageId) || typeof d.state !== 'string' || !deliveryStates.includes(d.state))
            return null;
        deliveryIds.add(d.id);
        rows.find(m => m.id === d.messageId)?.deliveries.push({ id: d.id, state: d.state });
    }
    return { rows, capped: value.messages.length === 50, deliveriesCapped: value.deliveries.length === 100 };
}
