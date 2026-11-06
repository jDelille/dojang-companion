'use client';

import { useEffect, useState } from 'react';
import { inboxMemberTasks, messageTaskSummary } from '@/domain/inboxWork';
import type { FollowUp } from '@/domain/followUp';
import { classDay } from '@/domain/classMove';
import { explainHubError } from '@/domain/hubAction';
import { memberRead } from '@/integrations/memberActions';
import { Field, Input } from '@/templates/roster/components/ui/form';
import { Button } from '@/templates/roster/components/ui/button';
import MemberActionDialog, { type PreparedMemberAction } from '@/views/people/memberActionDialog';
import TaskCompletion from '@/views/crm/taskCompletion';

export default function InboxTasks({ memberId, name, messageId, externalLocked, onLockChange, onAuthenticationLost }: {
  memberId: string; name: string; messageId: string; externalLocked: boolean; onLockChange: (locked: boolean) => void; onAuthenticationLost: () => void;
}) {
  const [read, setRead] = useState<ReturnType<typeof inboxMemberTasks>>(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [summary, setSummary] = useState(() => messageTaskSummary(messageId)), [due, setDue] = useState(() => classDay(null));
  const [dirty, setDirty] = useState(false), [receipt, setReceipt] = useState('');
  const [prepared, setPrepared] = useState<PreparedMemberAction | null>(null), [completing, setCompleting] = useState<FollowUp | null>(null);
  const locked = dirty || prepared !== null || completing !== null;
  useEffect(() => { onLockChange(locked); }, [locked, onLockChange]);
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    void memberRead('crm_context', { query: '' }, controller.signal).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') {
        const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE';
        if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code);
        return;
      }
      const parsed = inboxMemberTasks(answer.result, memberId);
      if (!parsed) setError('HUB_RESPONSE_UNREADABLE'); else setRead(parsed);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, reload, onAuthenticationLost]);
  function refresh() { setRead(null); setError(''); setReload(n => n + 1); }
  return <section aria-label="Member follow-up tasks" className="space-y-3 border-t border-(--crm-line) pt-4 text-xs">
    <header className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Member follow-up</h3><Button size="sm" disabled={locked || externalLocked} onClick={refresh}>Refresh tasks</Button></header>
    <p className="muted">Tasks belong to {name}. These are this student's tasks. Completing a task does not close the message.</p>
    {receipt && <p role="status">{receipt}</p>}
    {error ? <div role="alert"><p>{explainHubError(error)}</p><Button size="sm" disabled={locked || externalLocked} onClick={refresh}>Try again</Button></div> : !read ? <p role="status">Loading permitted tasks...</p> : <>
      {read.capped && <p className="muted">The task read is limited; other tasks may be omitted.</p>}
      {read.tasks.length === 0 && <p>No open member tasks were included in this read.</p>}
      <ul className="divide-y divide-(--crm-line)">{read.tasks.map(t => <li key={t.id} className="space-y-2 py-3"><p className="font-semibold">{t.summary}</p><p className="muted">{t.state} / Due {t.due ?? 'not supplied'} / {t.owner}</p>{t.canComplete && t.state !== 'done' && <Button size="sm" disabled={locked || externalLocked} onClick={() => setCompleting(t)}>Record outcome</Button>}</li>)}</ul>
      <form className="space-y-3" onSubmit={e => {
        e.preventDefault(); if (!summary.trim() || prepared || completing || externalLocked) return;
        setPrepared({ title: 'Create internal follow-up', command: { operation: 'create_task', payload: { relatedType: 'member', relatedId: memberId, summary: summary.trim(), due } }, evidence: [{ label: 'Student', value: `${name} / ID ${memberId}` }, { label: 'Source message reference', value: `Message #${messageId}` }, { label: 'Task', value: summary.trim() }, { label: 'Due', value: due }], effects: ['Creates one internal task assigned to your signed-in Odoo account on this student.', 'Does not send a reply, change a booking or resolve the message. The message reference is retained in the task summary only if you include it.'] });
      }}>
        <fieldset disabled={externalLocked || prepared !== null || completing !== null} className="space-y-3">
          <Field label="Follow-up task"><Input required maxLength={200} value={summary} onChange={e => { setSummary(e.target.value); setDirty(true); }} /></Field>
          <Field label="Due date"><Input required type="date" value={due} onChange={e => { setDue(e.target.value); setDirty(true); }} /></Field>
          <div className="flex flex-wrap gap-2"><Button size="sm" type="submit" disabled={!summary.trim()}>Review task</Button>{dirty && <Button size="sm" type="button" onClick={() => { setSummary(messageTaskSummary(messageId)); setDue(classDay(null)); setDirty(false); }}>Discard local changes</Button>}</div>
        </fieldset>
      </form>
    </>}
    {prepared && <MemberActionDialog prepared={prepared} onAuthenticationLost={onAuthenticationLost} onClose={() => setPrepared(null)} onSaved={result => { setReceipt(`Task #${String(result.taskId)} created in Odoo. No message sent.`); setSummary(messageTaskSummary(messageId)); setDirty(false); refresh(); }} />}
    {completing && <TaskCompletion onAuthenticationLost={onAuthenticationLost} task={completing} subject={{ kind: 'member', id: memberId }} enabled onClose={() => setCompleting(null)} onReload={refresh} onDone={() => { setReceipt(`Task #${completing.id} completion confirmed. No message sent.`); setCompleting(null); refresh(); }} />}
  </section>;
}
