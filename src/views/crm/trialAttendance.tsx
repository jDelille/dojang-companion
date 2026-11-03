'use client';

import { useEffect, useRef, useState } from 'react';
import type { TrialAttendancePayload, TrialAttendanceResult, TrialRecord } from '@/domain/trial';
import { explainHubError, newRequestKey } from '@/domain/hubAction';
import { getTrialContext, type TrialRead } from '@/integrations/trial';
import { recordTrialAttendance } from '@/integrations/crmWrites';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import HubUnavailable from '@/views/shell/hubUnavailable';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Select, Textarea } from '@/templates/roster/components/ui/form';
import { Modal } from '@/templates/roster/components/ui/overlay';
import { TimeLabel } from './localTime';
import '@/templates/roster/roster.css';

type Review = { trial: TrialRecord; payload: TrialAttendancePayload };
const LABELS = { reserved: 'Reserved', attended: 'Attended', no_show: 'No-show', cancelled: 'Cancelled', converted: 'Converted' };
export default function TrialAttendance({ leadId, initialTrialId = '', onClose, onRecorded }: { leadId: string; initialTrialId?: string; onClose: () => void; onRecorded: () => void }) {
  const [read, setRead] = useState<TrialRead | null>(null), [reload, setReload] = useState(0);
  const [trialId, setTrialId] = useState(initialTrialId), [reason, setReason] = useState(''), [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<'editing' | 'review' | 'pending' | 'uncertain' | 'failed' | 'saved'>('editing');
  const [review, setReview] = useState<Review | null>(null), [receipt, setReceipt] = useState<TrialAttendanceResult | null>(null);
  const [error, setError] = useState('');
  const frozen = useRef<{ review: Review; key: string } | null>(null), inFlight = useRef(false), mounted = useRef(true);
  const errorPanel = useRef<HTMLElement | null>(null);
  const resetSession = useStaffSessionReset(), markSignedOut = useMarkSignedOut();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (error) errorPanel.current?.focus(); }, [error]);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void getTrialContext(leadId, '', controller.signal).then(result => {
      if (!cancelled) setRead(result);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [leadId, reload]);
  const context = read?.outcome === 'loaded' ? read.context : null;
  const trial = context?.trials.find(t => t.id === trialId);
  const locked = status === 'pending' || status === 'uncertain';
  const reviewing = status === 'review' || locked || status === 'saved';
  const valid = trial?.state === 'reserved' && trial.session.canRecordOutcome === true && !!reason.trim() && confirmed;
  function close() { if (!locked && !inFlight.current) onClose(); }
  function refresh() {
    if (locked) return;
    setRead(null); setTrialId(''); setReview(null); setError(''); setConfirmed(false); setStatus('editing'); setReload(n => n + 1);
  }
  function prepare() {
    if (!valid || !trial || status === 'failed') return;
    setReview({ trial, payload: { trialId: trial.id, expectedVersion: trial.version, outcome: 'attended', reason: reason.trim() } });
    setStatus('review'); setError('');
  }
  async function save() {
    if (inFlight.current || !review || (status !== 'review' && status !== 'uncertain')) return;
    frozen.current ??= { review, key: newRequestKey() };
    const request = frozen.current;
    inFlight.current = true; setStatus('pending'); setError('');
    const answer = await recordTrialAttendance(request.review.payload, leadId, request.review.trial, request.key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === 'notConfirmed') { setStatus('uncertain'); return; }
    frozen.current = null;
    if (answer.outcome === 'failed') {
      if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(answer.code)) { resetSession(); markSignedOut(); onClose(); return; }
      setError(answer.code); setStatus('failed'); return;
    }
    setReceipt(answer.result); setStatus('saved'); onRecorded();
  }
  if (read?.outcome === 'unavailable' && ['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(read.code)) return <HubUnavailable code={read.code} text={read.text} />;
  return <div className="roster-scope"><Modal open onClose={close} title="Record trial attendance" width="lg"
    description="Authorized staff recording of actual attendance for a reserved trial class."
    footer={<><Button type="button" variant="ghost" disabled={locked} onClick={close}>{status === 'saved' ? 'Done' : 'Cancel'}</Button>
      {!reviewing && <Button type="button" onClick={refresh}>Refresh trial records</Button>}
      {status === 'review' && <Button type="button" onClick={() => setStatus('editing')}>Back to edit</Button>}
      {status !== 'saved' && <Button type="button" variant="primary" disabled={status === 'pending' || status === 'failed' || (!reviewing && !valid)} onClick={() => reviewing ? void save() : prepare()}>{status === 'pending' ? 'Waiting for Odoo…' : status === 'uncertain' ? 'Retry same attendance action' : status === 'review' ? 'Confirm attendance' : 'Review attendance'}</Button>}</>}>
    {error && <section ref={errorPanel} tabIndex={-1} role="alert" className="mb-4 rounded-lg border border-(--crm-warning) p-4 text-sm"><h2 className="font-semibold">Attendance was not confirmed</h2><p className="mt-2">{error === 'VERSION_CONFLICT' ? 'This trial changed. Refresh the records and review again.' : explainHubError(error)}</p><p className="mt-2">Refresh trial records before another attempt.</p><p className="mt-2 text-xs">Error code: {error}</p></section>}
    {receipt ? <section role="status" className="space-y-3 text-sm"><h2 className="font-semibold">Trial attendance recorded in Odoo</h2><p>Attendance #{receipt.attendanceId} · Trial #{receipt.trialId}{receipt.replayed ? ' · Original request confirmed' : ''}</p><p>Lead #{receipt.leadId} · Student #{receipt.memberId} · Class #{receipt.sessionId}</p><p>This is recorded attendance evidence for CRM follow-up. The CRM stage was not changed and no message was sent.</p></section> : reviewing && review ? <section aria-label="Trial attendance review" className="space-y-3 text-sm">
      <p><strong>{review.trial.member.name}</strong> · Student ID {review.trial.member.id}</p><p>{review.trial.session.title} · <TimeLabel iso={review.trial.session.startsAt} /> · Class ID {review.trial.session.id}</p>
      <p>Trial #{review.trial.id} · Lead #{leadId}</p><p className="whitespace-pre-wrap">{review.payload.reason}</p>
      <p>Records a present attendance log, marks the class registration present, and marks this trial attended. Odoo rechecks the trial version, time window, registration and existing attendance.</p>
      <p className="muted">No CRM stage change, paid membership, or message is included. This is a staff attendance record; it does not claim the student used the kiosk.</p>
    </section> : <div className="space-y-4">
      {!read && <p role="status">Loading trial records…</p>}
      {read?.outcome === 'unavailable' && <p role="alert">{read.text}</p>}
      {context && <><p className="text-sm font-semibold">{context.lead.name}</p>
        {context.trials.length === 0 ? <p role="status" className="text-sm muted">Odoo returned no trial records for this lead.</p> : <>
          <Field label="Reserved trial"><Select value={trialId} onChange={e => { setTrialId(e.target.value); setConfirmed(false); }}><option value="">Choose the student and booked class</option>{context.trials.map(t => <option key={t.id} value={t.id} disabled={t.state !== 'reserved' || t.session.canRecordOutcome !== true}>{t.member.name} · {t.session.title} · {new Date(t.session.startsAt).toLocaleString()} · {LABELS[t.state]}{t.state === 'reserved' && t.session.canRecordOutcome !== true ? t.session.canRecordOutcome === false ? ' — attendance window not yet open' : ' — attendance availability not provided' : ''}</option>)}</Select></Field>
          <p className="text-xs muted">Times use this device’s time zone. Attendance opens 15 minutes before class; Odoo also rejects records more than 31 days after class ends. Refresh when the window opens.</p>
          <Field label="Attendance evidence / staff note"><Textarea value={reason} maxLength={500} onChange={e => setReason(e.target.value)} /></Field>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I verified that this student actually attended the selected class.</label>
          <details className="text-sm"><summary>Trial history in this read ({context.trials.length}{context.trials.length === 20 ? ', latest 20' : ''})</summary><ul className="mt-2 space-y-2">{context.trials.map(t => <li key={t.id}>Trial #{t.id} · {t.member.name} · <TimeLabel iso={t.session.startsAt} /> · {LABELS[t.state]}</li>)}</ul></details>
        </>}
      </>}
    </div>}
    {status === 'uncertain' && <p role="status" className="mt-4 text-sm text-(--crm-warning)">Attendance is not confirmed and may have reached Odoo. Retry preserves the same trial, outcome, version, note and request key.</p>}
  </Modal></div>;
}
