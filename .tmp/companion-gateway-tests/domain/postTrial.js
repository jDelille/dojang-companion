"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStageProposalPayload = isStageProposalPayload;
exports.isStageProposalResult = isStageProposalResult;
exports.stageReviewContextFrom = stageReviewContextFrom;
exports.attendedStage = attendedStage;
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const text = (v) => typeof v === 'string';
const version = (v) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const day = (v) => text(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
function isStageProposalPayload(v) {
    return obj(v) && Object.keys(v).sort().join() === 'due,expectedVersion,leadId,reason,stageId' && id(v.leadId) && id(v.stageId)
        && version(v.expectedVersion) && text(v.reason) && !!v.reason.trim() && v.reason.length <= 120 && day(v.due);
}
function isStageProposalResult(v, p) {
    return obj(v) && v.leadId === p.leadId && id(v.taskId) && v.state === 'proposed' && v.stageChanged === false && typeof v.replayed === 'boolean';
}
function stageReviewContextFrom(v, leadId) {
    if (!obj(v) || !obj(v.lead) || v.lead.id !== leadId || !text(v.lead.name) || !version(v.lead.version)
        || !(v.lead.stageId === null || id(v.lead.stageId)) || !text(v.lead.stage) || !Array.isArray(v.stages) || !Array.isArray(v.tasks) || v.tasks.length > 50)
        return null;
    const stages = [], tasks = [];
    for (const s of v.stages) {
        if (!obj(s) || !id(s.id) || !text(s.name))
            return null;
        stages.push({ id: s.id, name: s.name });
    }
    for (const t of v.tasks) {
        if (!obj(t) || !id(t.id) || !text(t.summary) || !day(t.due) || !text(t.owner) || typeof t.state !== 'string' || !['done', 'overdue', 'today', 'planned'].includes(t.state)
            || t.relatedType !== 'lead' || t.relatedId !== leadId)
            return null;
        tasks.push({ id: t.id, summary: t.summary, due: t.due, owner: t.owner, state: t.state });
    }
    if (new Set(stages.map(s => s.id)).size !== stages.length || new Set(tasks.map(t => t.id)).size !== tasks.length)
        return null;
    return { lead: { id: leadId, name: v.lead.name, version: v.lead.version, stageId: v.lead.stageId, stage: v.lead.stage }, stages, tasks };
}
// A display suggestion from an explicit configured label, never an invented ID.
function attendedStage(stages) {
    const matches = stages.filter(s => s.name.trim().toLowerCase() === 'trial attended');
    return matches.length === 1 ? matches[0] : null;
}
