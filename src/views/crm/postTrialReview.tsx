'use client';

import { useEffect, useRef, useState } from 'react';
import type { TrialContext, TrialRecord } from '@/domain/trial';
import { attendedStage, isStageProposalPayload, type StageReviewContext, type StageProposalPayload } from '@/domain/postTrial';
import { explainHubError, newRequestKey, type PrepareLeadActionPayload } from '@/domain/hubAction';
import { classDay } from '@/domain/classMove';
import { getTrialContext } from '@/integrations/trial';
import { getStageReviewContext } from '@/integrations/postTrial';
import { proposeStage } from '@/integrations/crmWrites';
import { prepareLeadAction } from '@/integrations/hub';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import HubUnavailable from '@/views/shell/hubUnavailable';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Input, Select, Textarea } from '@/templates/roster/components/ui/form';
import { Modal } from '@/templates/roster/components/ui/overlay';
import { TimeLabel } from './localTime';
import '@/templates/roster/roster.css';

export type PostTrialMode = 'follow_up' | 'stage';
type Review = { kind: 'follow_up'; payload: PrepareLeadActionPayload; trial: TrialRecord } | { kind: 'stage'; payload: StageProposalPayload; trial: TrialRecord; stageName: string };
type Read = { trials: TrialContext; crm: StageReviewContext };
export default function PostTrialReview({ leadId, initialTrialId = '', mode, onClose, onSaved }: {
  leadId: string; initialTrialId?: string; mode: PostTrialMode; onClose: () => void; onSaved: () => void;
}) {
  const [read, setRead] = useState<Read | null>(null), [readError, setReadError] = useState(''), [reload, setReload] = useState(0);
  const [trialId, setTrialId] = useState(initialTrialId), [stageId, setStageId] = useState('');
  const [note, setNote] = useState(''), [due, setDue] = useState(() => classDay(null));
  const [status, setStatus] = useState<'editing' | 'review' | 'pending' | 'uncertain' | 'failed' | 'saved'>('editing');
  const [review, setReview] = useState<Review | null>(null), [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ taskId: string; replayed: boolean } | null>(null);
  const frozen = useRef<{ review: Review; key: string } | null>(null), mounted = useRef(true), inFlight = useRef(false);
  const errorPanel = useRef<HTMLElement | null>(null);
  const resetSession = useStaffSessionReset(), markSignedOut = useMarkSignedOut();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (error) errorPanel.current?.focus(); }, [error]);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void Promise.all([getTrialContext(leadId, '', controller.signal), getStageReviewContext(leadId, controller.signal)]).then(([trials, crm]) => {
      if (cancelled) return;
      const errors = [trials, crm].filter(r => r.outcome === 'unavailable');
      const failure = errors.find(r => ['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(r.code)) ?? errors[0];
      if (failure) { setReadError(failure.code); return; }
      if (trials.outcome !== 'loaded' || crm.outcome !== 'loaded') return;
      // Two reads can straddle another staff edit. Require a coherent lead snapshot.
      if (trials.context.lead.version !== crm.context.lead.version) { setReadError('VERSION_CONFLICT'); return; }
      setRead({ trials: trials.context, crm: crm.context }); setReadError('');
      const suggested = attendedStage(crm.context.stages);
      setStageId(suggested && suggested.id !== crm.context.lead.stageId ? suggested.id : '');
    });
    return () => { cancelled = true; controller.abort(); };
  }, [leadId, reload]);
  const trials = read?.trials.trials.filter(t => t.state === 'attended') ?? [];
  const trial = trials.find(t => t.id === trialId);
  const target = read?.crm.stages.find(s => s.id === stageId);
  const prefix = trial ? `Trial #${trial.id}, student #${trial.member.id}, class #${trial.session.id} attended. ` : '';
  const reason = prefix + note.trim();
  const locked = status === 'pending' || status === 'uncertain';
  const reviewing = status === 'review' || locked || status === 'saved';
  const valid = !!(read && trial && note.trim() && /^\d{4}-\d{2}-\d{2}$/.test(due) && reason.length <= (mode === 'stage' ? 120 : 800)
    && (mode === 'follow_up' || (target && target.id !== read.crm.lead.stageId)));
  function close() { if (!inFlight.current && !locked) onClose(); }
  function refresh() {
    if (locked) return;
    setRead(null); setReadError(''); setReview(null); setError(''); setStatus('editing'); setReload(n => n + 1);
  }
  function prepare() {
    if (!valid || !read || !trial || status === 'failed') return;
    if (mode === 'stage' && target) {
      const payload = { leadId, expectedVersion: read.crm.lead.version, stageId: target.id, reason, due };
      if (!isStageProposalPayload(payload)) { setError('INVALID_COMMAND'); return; }
      setReview({ kind: 'stage', payload, trial, stageName: target.name });
    } else setReview({ kind: 'follow_up', payload: { leadId, expectedVersion: read.crm.lead.version, kind: 'follow_up', reason, due }, trial });
    setStatus('review'); setError('');
  }
  async function save() {
    if (!review || inFlight.current || (status !== 'review' && status !== 'uncertain')) return;
    frozen.current ??= { review, key: newRequestKey() };
    const request = frozen.current;
    inFlight.current = true; setStatus('pending'); setError('');
    const answer = request.review.kind === 'stage' ? await proposeStage(request.review.payload, request.key) : await prepareLeadAction(request.review.payload, request.key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === 'notConfirmed') { setStatus('uncertain'); return; }
    frozen.current = null;
    if (answer.outcome === 'failed') {
      if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(answer.code)) { resetSession(); markSignedOut(); onClose(); return; }
      setError(answer.code); setStatus('failed'); return;
    }
    setReceipt({ taskId: answer.result.taskId, replayed: answer.result.replayed }); setStatus('saved'); onSaved();
  }
  if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(readError)) return <HubUnavailable code={readError} text={explainHubError(readError)} />;
  return <div className="roster-scope"><Modal open onClose={close} title={mode === 'stage' ? 'Propose post-trial stage review' : 'Prepare post-trial follow-up'} width="lg"
    description="Use recorded trial attendance as evidence for one reviewed internal task."
    footer={<><Button type="button" variant="ghost" disabled={locked} onClick={close}>{receipt ? 'Done' : 'Cancel'}</Button>
      {!reviewing && <Button type="button" onClick={refresh}>Refresh evidence</Button>}
      {status === 'review' && <Button type="button" onClick={() => setStatus('editing')}>Back to edit</Button>}
      {!receipt && <Button type="button" variant="primary" disabled={status === 'pending' || status === 'failed' || (!reviewing && !valid)} onClick={() => reviewing ? void save() : prepare()}>{status === 'pending' ? 'Waiting for Odoo…' : status === 'uncertain' ? 'Retry same task' : status === 'review' ? 'Confirm internal task' : 'Review internal task'}</Button>}</>}>
    {error && <section ref={errorPanel} tabIndex={-1} role="alert" className="mb-4 text-sm"><h2 className="font-semibold">Task was not confirmed</h2><p>{explainHubError(error)} Refresh evidence before another attempt.</p><p>Error code: {error}</p></section>}
    {receipt ? <section role="status" className="space-y-3 text-sm"><h2 className="font-semibold">{mode === 'stage' ? 'Stage review task created in Odoo' : 'Follow-up task created in Odoo'}</h2><p>Task #{receipt.taskId} · Lead #{leadId}{receipt.replayed ? ' · Original request confirmed' : ''}</p><p>The CRM stage is unchanged. No message was sent. Find the internal task in this lead’s Tasks section.</p></section> : reviewing && review ? <section aria-label="Post-trial task review" className="space-y-3 text-sm">
      <p><strong>{review.trial.member.name}</strong> attended {review.trial.session.title} · <TimeLabel iso={review.trial.session.startsAt} /></p>
      <p>Evidence: trial #{review.trial.id} is recorded as attended in Odoo. This is not inferred from the class date or CRM stage.</p>
      {review.kind === 'stage' && <p>Requested review: {read?.crm.lead.stage} → {review.stageName}. This creates a review task; it does not move the lead.</p>}
      <p className="whitespace-pre-wrap">Reason: {review.payload.reason}</p><p>Due: {review.payload.due} · Assigned to your signed-in Odoo account.</p>
      <p className="muted">Odoo checks the lead version, permissions and requested fields. No message, new reservation, membership, or stage change is included.</p>
    </section> : <div className="space-y-4">
      {!read && !readError && <p role="status">Loading attendance evidence and configured stages…</p>}
      {readError && <p role="alert">{explainHubError(readError)}</p>}
      {read && <><p className="text-sm font-semibold">{read.crm.lead.name} · Current stage: {read.crm.lead.stage}</p>
        {trials.length === 0 ? <p className="text-sm muted">No attended trial was returned for this lead. Record actual trial attendance first.</p> : <>
          <Field label="Recorded attended trial"><Select value={trialId} onChange={e => setTrialId(e.target.value)}><option value="">Select the attendance evidence</option>{trials.map(t => <option key={t.id} value={t.id}>{t.member.name} · {t.session.title} · Trial #{t.id} · Attended</option>)}</Select></Field>
          {mode === 'stage' && <><Field label="Configured stage to review"><Select value={stageId} onChange={e => setStageId(e.target.value)}><option value="">Choose an Odoo stage</option>{read.crm.stages.filter(s => s.id !== read.crm.lead.stageId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            {!attendedStage(read.crm.stages) && <p className="text-xs muted">A unique “Trial Attended” stage was not returned by Odoo. Choose an appropriate configured stage for review; this screen does not create stages.</p>}
            {attendedStage(read.crm.stages)?.id === read.crm.lead.stageId && <p className="text-xs muted">This lead is already in the configured Trial Attended stage.</p>}
          </>}
          <Field label={mode === 'stage' ? 'Reason for stage review' : 'Post-trial follow-up instructions'} hint={`The task includes the trial, student and class IDs. ${Math.max(0, (mode === 'stage' ? 120 : 800) - prefix.length)} characters available for your note.`}><Textarea value={note} maxLength={Math.max(0, (mode === 'stage' ? 120 : 800) - prefix.length)} onChange={e => setNote(e.target.value)} /></Field>
          <Field label="Task due date"><Input type="date" value={due} onChange={e => setDue(e.target.value)} /></Field>
          <p className="text-xs muted">Creates one internal task assigned to you. A follow-up task is not an outbound communication. A stage proposal is not a stage change.</p>
          <details className="text-sm"><summary>Existing open tasks in this read ({read.crm.tasks.filter(t => t.state !== 'done').length}{read.crm.tasks.length === 50 ? ', capped read' : ''})</summary><ul className="mt-2 space-y-2">{read.crm.tasks.filter(t => t.state !== 'done').map(t => <li key={t.id}>{t.summary} · Due {t.due} · {t.owner}</li>)}</ul><p className="mt-2 muted">Review these before creating another task.</p></details>
        </>}
      </>}
    </div>}
    {status === 'uncertain' && <p role="status" className="mt-4 text-sm">The task may have reached Odoo. Retry preserves the same payload and request key; do not create a second task.</p>}
  </Modal></div>;
}
