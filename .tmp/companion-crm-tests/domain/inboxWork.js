"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inboxMemberTasks = inboxMemberTasks;
exports.inboxClassOptions = inboxClassOptions;
exports.messageTaskSummary = messageTaskSummary;
const memberActions_1 = require("./memberActions");
function inboxMemberTasks(raw, memberId) {
    if (!(0, memberActions_1.recordId)(memberId) || !(0, memberActions_1.object)(raw) || !Array.isArray(raw.tasks) || raw.tasks.length > 100 || typeof raw.moreTasks !== 'boolean')
        return null;
    const tasks = [], seen = new Set();
    for (const t of raw.tasks) {
        if (!(0, memberActions_1.object)(t) || !(0, memberActions_1.recordId)(t.id) || seen.has(t.id) || !(0, memberActions_1.recordId)(t.relatedId)
            || !['member', 'lead'].includes(String(t.relatedType)) || !(0, memberActions_1.string)(t.relatedName) || !(0, memberActions_1.string)(t.summary)
            || !(t.due === null || ((0, memberActions_1.string)(t.due) && /^\d{4}-\d{2}-\d{2}$/.test(t.due) && Number.isFinite(Date.parse(t.due)) && new Date(t.due).toISOString().slice(0, 10) === t.due))
            || !(0, memberActions_1.string)(t.owner) || !['overdue', 'today', 'planned', 'done'].includes(String(t.state)) || !(0, memberActions_1.nonnegative)(t.version) || typeof t.canComplete !== 'boolean')
            return null;
        seen.add(t.id);
        if (t.relatedType === 'member' && t.relatedId === memberId)
            tasks.push({ id: t.id, relatedType: 'member', relatedId: memberId,
                relatedName: t.relatedName, summary: t.summary, due: t.due, owner: t.owner, state: t.state, version: t.version, canComplete: t.canComplete });
    }
    return { tasks, capped: raw.moreTasks };
}
// These are scoped class options, not an eligibility determination or a seat hold.
function inboxClassOptions(context, memberId, query, now) {
    if (!context.members.some(m => m.id === memberId))
        return [];
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return context.sessions.filter(s => s.future && s.startsAt && Date.parse(s.startsAt) > now
        && terms.every(term => s.title.toLocaleLowerCase().includes(term))).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
function messageTaskSummary(messageId) {
    return (0, memberActions_1.recordId)(messageId) ? `Follow up on inbox message #${messageId}` : '';
}
