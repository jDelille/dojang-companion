import type { HubContext } from './inbox';
import type { FollowUp } from './followUp';
import { object, recordId, nonnegative, string } from './memberActions';

export function inboxMemberTasks(raw: unknown, memberId: string): { tasks: FollowUp[]; capped: boolean } | null {
  if (!recordId(memberId) || !object(raw) || !Array.isArray(raw.tasks) || raw.tasks.length > 100 || typeof raw.moreTasks !== 'boolean') return null;
  const tasks: FollowUp[] = [], seen = new Set<string>();
  for (const t of raw.tasks) {
    if (!object(t) || !recordId(t.id) || seen.has(t.id) || !recordId(t.relatedId)
      || !['member', 'lead'].includes(String(t.relatedType)) || !string(t.relatedName) || !string(t.summary)
      || !(t.due === null || (string(t.due) && /^\d{4}-\d{2}-\d{2}$/.test(t.due) && Number.isFinite(Date.parse(t.due)) && new Date(t.due).toISOString().slice(0, 10) === t.due))
      || !string(t.owner) || !['overdue', 'today', 'planned', 'done'].includes(String(t.state)) || !nonnegative(t.version) || typeof t.canComplete !== 'boolean') return null;
    seen.add(t.id);
    if (t.relatedType === 'member' && t.relatedId === memberId) tasks.push({ id: t.id, relatedType: 'member', relatedId: memberId,
      relatedName: t.relatedName, summary: t.summary, due: t.due as string | null, owner: t.owner, state: t.state as FollowUp['state'], version: t.version, canComplete: t.canComplete });
  }
  return { tasks, capped: raw.moreTasks };
}

// These are scoped class options, not an eligibility determination or a seat hold.
export function inboxClassOptions(context: HubContext, memberId: string, query: string, now: number) {
  if (!context.members.some(m => m.id === memberId)) return [];
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return context.sessions.filter(s => s.future && s.startsAt && Date.parse(s.startsAt) > now
    && terms.every(term => s.title.toLocaleLowerCase().includes(term))).sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
}

export function messageTaskSummary(messageId: string) {
  return recordId(messageId) ? `Follow up on inbox message #${messageId}` : '';
}
