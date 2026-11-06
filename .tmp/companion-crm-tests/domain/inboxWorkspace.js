"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INBOX_QUEUES = void 0;
exports.matchesQueue = matchesQueue;
exports.inboxMessages = inboxMessages;
exports.selectedInboxMessage = selectedInboxMessage;
exports.isInboxContext = isInboxContext;
// Roster shows a count on Open only
exports.INBOX_QUEUES = [
    { key: 'open', label: 'Open', showCount: true },
    { key: 'needs', label: 'Needs you', showCount: false },
    { key: 'closed', label: 'Closed', showCount: false },
    { key: 'all', label: 'All', showCount: false },
];
const DELIVERY_PROBLEMS = ['failed', 'uncertain', 'cancelled'];
function matchesQueue(context, message, queue) {
    const delivery = context.deliveries.find(d => d.messageId === message.id);
    const delivered = delivery?.state === 'delivered';
    switch (queue) {
        case 'open': return !delivered;
        case 'needs': return !delivery || DELIVERY_PROBLEMS.includes(delivery.state);
        case 'closed': return delivered;
        case 'all': return true;
    }
}
function inboxMessages(context, queue, channel, query) {
    const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    return context.messages.filter(message => {
        if (!matchesQueue(context, message, queue) || (channel !== 'all' && channel !== message.channel))
            return false;
        const member = context.members.find(m => m.id === message.memberId);
        const session = context.sessions.find(s => s.id === message.sessionId);
        const text = [message.id, message.text, message.guardianName, message.contactRef, member?.name, session?.title].join(' ').toLocaleLowerCase();
        return terms.every(term => text.includes(term));
    });
}
// Never keep a record visible outside the currently selected queue/search.
function selectedInboxMessage(messages, selectedId) {
    return messages.find(message => message.id === selectedId) ?? messages[0] ?? null;
}
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const text = (v) => typeof v === 'string';
const version = (v) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const nullableId = (v) => v === null || id(v);
const date = (v) => v === null || (typeof v === 'string' && Number.isFinite(Date.parse(v)));
const states = ['queued', 'dispatching', 'accepted', 'delivered', 'failed', 'uncertain', 'cancelled'];
function rows(v, check, max = Infinity) {
    if (!Array.isArray(v) || v.length > max)
        return false;
    const seen = new Set();
    return v.every(row => {
        if (!obj(row) || !id(row.id) || seen.has(row.id) || !check(row))
            return false;
        seen.add(row.id);
        return true;
    });
}
// Reject the whole unreadable snapshot, rather than showing plausible partial facts.
function isInboxContext(v) {
    if (!obj(v) || !obj(v.principal) || !id(v.principal.userId) || !id(v.principal.siteId)
        || !text(v.principal.name) || !text(v.principal.role) || !obj(v.capabilities))
        return false;
    const c = v.capabilities;
    if (!text(c.identity) || !text(c.ai) || !text(c.ebGym) || typeof c.productionReady !== 'boolean'
        || !['not_configured', 'configured_not_exercised'].includes(String(c.inbound))
        || !['not_configured', 'configured_not_exercised'].includes(String(c.outbound)))
        return false;
    if (!rows(v.members, m => text(m.name) && version(m.version) && text(m.state) && text(m.rank))
        || !rows(v.sessions, s => text(s.title) && date(s.startsAt) && typeof s.future === 'boolean' && version(s.version), 100)
        || !rows(v.messages, m => ['unmatched', 'received', 'resolved'].includes(String(m.state)) && version(m.revision)
            && ['text', 'summary', 'reply', 'mode', 'channel', 'guardianName', 'contactRef'].every(k => text(m[k]))
            && nullableId(m.memberId) && nullableId(m.sessionId), 50)
        || !rows(v.deliveries, d => id(d.messageId) && states.includes(String(d.state)) && (d.providerRef === null || text(d.providerRef)) && text(d.approvedBy) && date(d.approvedAt), 100)
        || !rows(v.timeline, t => id(t.memberId) && nullableId(t.sessionId) && text(t.action) && text(t.actor) && date(t.at), 50))
        return false;
    const messages = new Set(v.messages.map(m => m.id));
    const linked = new Set();
    return v.deliveries.every(d => {
        if (!messages.has(d.messageId) || linked.has(d.messageId))
            return false;
        linked.add(d.messageId);
        return true;
    });
}
