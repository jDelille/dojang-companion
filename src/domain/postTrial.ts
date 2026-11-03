export type StageProposalPayload = { leadId: string; expectedVersion: number; stageId: string; reason: string; due: string };
export type StageProposalResult = { leadId: string; taskId: string; state: 'proposed'; stageChanged: false; replayed: boolean };
export type StageReviewContext = { lead: { id: string; name: string; version: number; stageId: string | null; stage: string };
  stages: { id: string; name: string }[]; tasks: { id: string; summary: string; due: string; owner: string; state: string }[] };
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v: unknown): v is string => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const text = (v: unknown): v is string => typeof v === 'string';
const version = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const day = (v: unknown): v is string => text(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
export function isStageProposalPayload(v: unknown): v is StageProposalPayload {
  return obj(v) && Object.keys(v).sort().join() === 'due,expectedVersion,leadId,reason,stageId' && id(v.leadId) && id(v.stageId)
    && version(v.expectedVersion) && text(v.reason) && !!v.reason.trim() && v.reason.length <= 120 && day(v.due);
}
export function isStageProposalResult(v: unknown, p: StageProposalPayload): v is StageProposalResult {
  return obj(v) && v.leadId === p.leadId && id(v.taskId) && v.state === 'proposed' && v.stageChanged === false && typeof v.replayed === 'boolean';
}
export function stageReviewContextFrom(v: unknown, leadId: string): StageReviewContext | null {
  if (!obj(v) || !obj(v.lead) || v.lead.id !== leadId || !text(v.lead.name) || !version(v.lead.version)
    || !(v.lead.stageId === null || id(v.lead.stageId)) || !text(v.lead.stage) || !Array.isArray(v.stages) || !Array.isArray(v.tasks) || v.tasks.length > 50) return null;
  const stages: StageReviewContext['stages'] = [], tasks: StageReviewContext['tasks'] = [];
  for (const s of v.stages) { if (!obj(s) || !id(s.id) || !text(s.name)) return null; stages.push({ id: s.id, name: s.name }); }
  for (const t of v.tasks) {
    if (!obj(t) || !id(t.id) || !text(t.summary) || !day(t.due) || !text(t.owner) || typeof t.state !== 'string' || !['done', 'overdue', 'today', 'planned'].includes(t.state)
      || t.relatedType !== 'lead' || t.relatedId !== leadId) return null;
    tasks.push({ id: t.id, summary: t.summary, due: t.due, owner: t.owner, state: t.state as string });
  }
  if (new Set(stages.map(s => s.id)).size !== stages.length || new Set(tasks.map(t => t.id)).size !== tasks.length) return null;
  return { lead: { id: leadId, name: v.lead.name, version: v.lead.version, stageId: v.lead.stageId, stage: v.lead.stage }, stages, tasks };
}
// A display suggestion from an explicit configured label, never an invented ID.
export function attendedStage(stages: StageReviewContext['stages']) {
  const matches = stages.filter(s => s.name.trim().toLowerCase() === 'trial attended');
  return matches.length === 1 ? matches[0] : null;
}
