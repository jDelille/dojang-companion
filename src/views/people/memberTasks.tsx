'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { memberRead } from '@/integrations/memberActions';
import { object, recordId, nonnegative, string } from '@/domain/memberActions';
import { explainHubError } from '@/domain/hubAction';
import { classDay } from '@/domain/classMove';
import { Field, Input } from '@/templates/roster/components/ui/form';
import { Button } from '@/templates/roster/components/ui/button';
import MemberActionDialog, { type PreparedMemberAction } from './memberActionDialog';
import TaskCompletion from '@/views/crm/taskCompletion';
import '@/templates/roster/roster.css';
type Task = { id: string; summary: string; due: string | null; owner: string; state: string; version: number; canComplete: boolean };
export default function MemberTasks({ memberId, name, onAuthenticationLost }: { memberId: string; name: string; onAuthenticationLost: () => void }) {
  const [tasks, setTasks] = useState<Task[] | null>(null), [more, setMore] = useState(false), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [summary, setSummary] = useState(''), [due, setDue] = useState(() => classDay(null));
  const [prepared, setPrepared] = useState<PreparedMemberAction | null>(null), [completing, setCompleting] = useState<Task | null>(null);
  const router = useRouter();
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    void memberRead('crm_context', { query: '' }, controller.signal).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') { const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); return; }
      const raw = answer.result;
      if (!Array.isArray(raw.tasks) || raw.tasks.length > 100 || typeof raw.moreTasks !== 'boolean') { setError('HUB_RESPONSE_UNREADABLE'); return; }
      const result: Task[] = [];
      for (const t of raw.tasks) {
        if (!object(t) || !recordId(t.id) || !recordId(t.relatedId) || !['member', 'lead'].includes(String(t.relatedType)) || !string(t.summary) || !(t.due === null || string(t.due)) || !string(t.owner) || !string(t.state) || !['overdue', 'today', 'planned', 'done'].includes(t.state) || !nonnegative(t.version) || typeof t.canComplete !== 'boolean') { setError('HUB_RESPONSE_UNREADABLE'); return; }
        if (t.relatedType === 'member' && t.relatedId === memberId) result.push({ id: t.id, summary: t.summary, due: t.due, owner: t.owner, state: t.state, version: t.version, canComplete: t.canComplete });
      }
      setTasks(result); setMore(raw.moreTasks);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, reload, onAuthenticationLost]);
  function refresh() { setTasks(null); setError(''); setCompleting(null); setReload(n => n + 1); router.refresh(); }
  return <div className="space-y-4"><section className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5"><h2 className="font-bold">Member notes and follow-up</h2><p className="mt-3 text-[13px] text-(--crm-text-secondary)">General student-note editing is not exposed by the current Hub. Existing internal tasks and their completion outcomes can be recorded here; they remain task records.</p></section>
    <section className="roster-scope rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5"><header className="flex justify-between gap-3"><h2 className="font-bold">Internal member tasks</h2><Button type="button" onClick={refresh}>Refresh tasks</Button></header>
      {error && <p role="alert" className="mt-3 text-sm">{explainHubError(error)}</p>}{!tasks && !error && <p role="status" className="mt-3 text-sm">Loading permitted member tasks…</p>}
      {tasks && <><p className="mt-3 text-xs muted">{more ? 'The source is capped; other member tasks may be omitted.' : 'Open tasks from the authorized CRM read.'}</p>{tasks.length === 0 && <p className="mt-3 text-sm">No tasks linked to this student were included in this read.</p>}<ul className="mt-3 divide-y divide-(--crm-line)">{tasks.map(t => <li key={t.id} className="space-y-2 py-3 text-sm"><p className="font-semibold">{t.summary}</p><p>{t.state} · Due {t.due ?? 'Date not supplied'} · {t.owner}</p>{t.canComplete && t.state !== 'done' && <Button type="button" onClick={() => setCompleting(t)}>Record outcome / complete task</Button>}</li>)}</ul>
        <form className="mt-4 space-y-3 border-t border-(--crm-line) pt-4" onSubmit={e => { e.preventDefault(); setPrepared({ title: 'Create internal member task', command: { operation: 'create_task', payload: { relatedType: 'member', relatedId: memberId, summary: summary.trim(), due } }, evidence: [{ label: 'Student', value: `${name} · ID ${memberId}` }, { label: 'Task', value: summary.trim() }, { label: 'Due date', value: due }], effects: ['Creates one internal task on this student, assigned to your signed-in Odoo account. No message is sent and no member profile fields are changed.'] }); }}><Field label="New task"><Input value={summary} maxLength={200} required onChange={e => setSummary(e.target.value)} /></Field><Field label="Due date"><Input type="date" value={due} required onChange={e => setDue(e.target.value)} /></Field><Button type="submit" disabled={!summary.trim()}>Review internal task</Button></form>
      </>}
    </section>
    {completing && <TaskCompletion key={completing.id} task={completing} subject={{ kind: 'member', id: memberId }} enabled onClose={() => setCompleting(null)} onReload={refresh} onDone={refresh} />}
    {prepared && <MemberActionDialog prepared={prepared} onAuthenticationLost={onAuthenticationLost} onClose={() => { setPrepared(null); setSummary(''); refresh(); }} onSaved={() => router.refresh()} />}
  </div>;
}
