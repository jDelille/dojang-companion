'use client';

// Adapted from Companion hub/TrialPanel.tsx's reservation workflow and Roster's
// migrated forms/dialogs. Cancellation, outcomes and conversion are separate actions.
import { useEffect, useRef, useState } from 'react';
import type { ReserveTrialPayload, ReserveTrialResult, TrialSession, TrialStudent } from '@/domain/trial';
import { isReserveTrialPayload } from '@/domain/trial';
import { explainHubError, newRequestKey } from '@/domain/hubAction';
import { getTrialContext, type TrialRead } from '@/integrations/trial';
import { reserveTrial } from '@/integrations/crmWrites';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import HubUnavailable from '@/views/shell/hubUnavailable';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Input, Select, Textarea } from '@/templates/roster/components/ui/form';
import { Modal } from '@/templates/roster/components/ui/overlay';
import { TimeLabel } from './localTime';
import StudentIntake from './studentIntake';
import type { StudentReceipt } from '@/domain/studentIntake';
import '@/templates/roster/roster.css';

type Review = { payload: ReserveTrialPayload; student: TrialStudent; session: TrialSession };
type Status = 'editing' | 'review' | 'pending' | 'uncertain' | 'failed' | 'saved';
const STATES = { reserved: 'Reserved', attended: 'Attended', no_show: 'No-show', cancelled: 'Cancelled', converted: 'Converted' };
export default function TrialReservation({ leadId, onClose, onReserved }: {
  leadId: string; onClose: () => void; onReserved: (result: ReserveTrialResult) => void;
}) {
  const [read, setRead] = useState<TrialRead | null>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [reload, setReload] = useState(0);
  const [memberId, setMemberId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<Status>('editing');
  const [review, setReview] = useState<Review | null>(null);
  const [receipt, setReceipt] = useState<ReserveTrialResult | null>(null);
  const [error, setError] = useState('');
  const errorPanel = useRef<HTMLElement | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [created, setCreated] = useState<{ receipt: StudentReceipt; name: string } | null>(null);
  const selectCreated = useRef<string | null>(null);
  const frozen = useRef<{ payload: ReserveTrialPayload; key: string } | null>(null);
  const inFlight = useRef(false), mounted = useRef(true);
  const resetSession = useStaffSessionReset(), markSignedOut = useMarkSignedOut();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (error) errorPanel.current?.focus(); }, [error]);
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    void getTrialContext(leadId, search, controller.signal).then(next => {
      if (cancelled) return;
      setRead(next);
      if (next.outcome === 'loaded' && selectCreated.current) {
        const found = next.context.students.find(s => s.id === selectCreated.current);
        if (found && ['lead', 'trial'].includes(found.state)) setMemberId(found.id);
        selectCreated.current = null;
      }
    });
    return () => { cancelled = true; controller.abort(); };
  }, [leadId, search, reload]);
  const context = read?.outcome === 'loaded' ? read.context : null;
  const student = context?.students.find(s => s.id === memberId);
  const session = context?.sessions.find(s => s.id === sessionId);
  const existing = context?.trials.find(t => t.state === 'reserved' || t.state === 'attended');
  const locked = status === 'pending' || status === 'uncertain';
  const needsRefresh = ['VERSION_CONFLICT', 'TRIAL_ALREADY_OPEN', 'SESSION_NOT_OPEN', 'ENROLLMENT_REVIEW_REQUIRED'].includes(error);
  const valid = !!(context && student && session && !existing && ['lead', 'trial'].includes(student.state) && reason.trim());
  function close() { if (!inFlight.current && !locked) onClose(); }
  function refresh(nextQuery = search) {
    if (locked) return;
    setRead(null); setSearch(nextQuery.trim()); setReload(n => n + 1);
    setMemberId(''); setSessionId(''); setReview(null); setError(''); setStatus('editing');
  }
  function prepare() {
    if (!valid || !context || !student || !session || needsRefresh) return;
    const payload: ReserveTrialPayload = { leadId, expectedLeadVersion: context.lead.version, memberId: student.id,
      sessionId: session.id, expectedSessionVersion: session.version, reason: reason.trim() };
    if (!isReserveTrialPayload(payload)) return;
    setReview({ payload, student, session }); setStatus('review'); setError('');
  }
  async function save() {
    if (inFlight.current || !review || (status !== 'review' && status !== 'uncertain')) return;
    frozen.current ??= { payload: review.payload, key: newRequestKey() };
    inFlight.current = true; setStatus('pending'); setError('');
    const answer = await reserveTrial(frozen.current.payload, frozen.current.key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === 'notConfirmed') { setStatus('uncertain'); return; }
    frozen.current = null;
    if (answer.outcome === 'failed') {
      if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(answer.code)) { resetSession(); markSignedOut(); onClose(); return; }
      setError(answer.code); setStatus('failed'); return;
    }
    setReceipt(answer.result); setStatus('saved'); onReserved(answer.result);
  }
  if (read?.outcome === 'unavailable' && ['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(read.code)) {
    return <HubUnavailable code={read.code} text={read.text} />;
  }
  const reviewing = status === 'review' || locked || status === 'saved';
  if (intakeOpen) return <StudentIntake onClose={() => setIntakeOpen(false)} onCreated={value => {
    setCreated(value); setIntakeOpen(false); selectCreated.current = value.receipt.memberId;
    setQuery(value.name.slice(0, 100)); refresh(value.name.slice(0, 100));
  }} />;
  return <div className="roster-scope"><Modal open onClose={close} title="Book a trial" width="lg"
    description="Select an existing prospective student or create a reviewed profile, then reserve a real class."
    footer={<>
      <Button type="button" variant="ghost" disabled={locked} onClick={close}>{status === 'saved' ? 'Done' : 'Cancel'}</Button>
      {!reviewing && <Button type="button" onClick={() => refresh()}>Refresh options</Button>}
      {status === 'review' && <Button type="button" onClick={() => setStatus('editing')}>Back to edit</Button>}
      {status !== 'saved' && <Button type="button" variant="primary" disabled={status === 'pending' || (!reviewing && (!valid || needsRefresh))}
        onClick={() => reviewing ? void save() : prepare()}>
        {status === 'pending' ? 'Waiting for Odoo…' : status === 'uncertain' ? 'Retry same reservation' : status === 'review' ? 'Confirm reservation' : 'Review reservation'}
      </Button>}
    </>}>
    {error && <section ref={errorPanel} tabIndex={-1} role="alert" className="mb-4 rounded-lg border border-(--crm-warning) p-4 text-sm text-(--crm-warning)">
      <h2 className="font-semibold">Reservation was not confirmed</h2>
      <p className="mt-2">{explainHubError(error)}</p>
      {needsRefresh && <p className="mt-2">Refresh options and review the current records before trying again.</p>}
      <p className="mt-2 text-xs">Error code: {error}</p>
    </section>}
    {status === 'saved' && receipt ? <section role="status" className="mb-4 rounded-lg border border-(--crm-line) p-4">
      <h2 className="font-semibold">Trial reserved in Odoo</h2>
      <p className="mt-2 text-sm">Trial #{receipt.trialId} · Registration #{receipt.enrollmentId}{receipt.replayed ? ' · Original request confirmed' : ''}</p>
      <p className="mt-1 text-sm muted">Lead #{receipt.leadId} · Student #{receipt.memberId} · Class #{receipt.sessionId}</p>
      <p className="mt-2 text-sm muted">Reservation is not attendance. No CRM stage change, paid membership, or message was included.</p>
    </section> : null}
    {reviewing && review ? <section aria-label="Trial reservation review" className="space-y-4 text-sm">
      <dl className="space-y-2"><div><dt className="muted">Student</dt><dd>{review.student.name} · {review.student.memberNumber || `ID ${review.student.id}`}</dd></div>
        <div><dt className="muted">Class</dt><dd>{review.session.title} · <TimeLabel iso={review.session.startsAt} /></dd></div>
        <div><dt className="muted">Reason</dt><dd className="whitespace-pre-wrap break-words">{review.payload.reason}</dd></div></dl>
      <div><h3 className="font-semibold">What this reservation does</h3><ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Creates or reactivates the registration for this student and class, and records the lead’s trial session.</li>
        <li>{review.student.state === 'lead' ? 'Changes the student’s status from lead to trial.' : 'Keeps the student’s trial status.'}</li>
        <li>Odoo rechecks scope, lead/class versions, duplicate trials, capacity, and course-roster rules.</li>
      </ul></div>
      <p className="muted">This trial uses trial-booking rules rather than paid-subscription eligibility. It does not mark attendance, change the CRM stage, create a paid membership, or send a message.</p>
    </section> : <div className="space-y-4">
      {!read && <p role="status" className="text-sm muted">Loading trial options…</p>}
      {read?.outcome === 'unavailable' && <p role="alert" className="text-sm text-(--crm-warning)">{read.text}</p>}
      {context && <>
        <p className="text-sm"><strong>{context.lead.name}</strong>{context.lead.contact ? ` · ${context.lead.contact}` : ''}</p>
        {existing ? <p role="status" className="rounded-lg border border-(--crm-line) p-4 text-sm">An open trial already exists: {existing.member.name} · {existing.session.title} · {STATES[existing.state]}. A second reservation is unavailable.</p> : <>
          {created && <p role="status" className="rounded-lg border border-(--crm-line) p-3 text-sm">Created {created.name} · {created.receipt.memberNumber} · Student ID {created.receipt.memberId}. {memberId === created.receipt.memberId ? 'Selected by its confirmed Odoo ID below.' : 'Find and select this exact student to continue.'} The lead relationship is recorded when the trial reservation is confirmed.</p>}
          <p className="text-sm muted">Search by student name and choose the exact prospective student. Active, paused and cancelled members are not eligible for this trial flow.</p>
          <Button type="button" onClick={() => setIntakeOpen(true)}>Create prospective student</Button>
          <div className="flex items-end gap-2"><div className="min-w-0 flex-1"><Field label="Find trial student"><Input value={query} maxLength={100} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); refresh(query); } }} /></Field></div>
            <Button type="button" onClick={() => refresh(query)}>Search</Button></div>
          {search && context.students.length === 0 && <p role="status" className="text-sm muted">No students matched this search.</p>}
          {context.students.length === 20 && <p className="text-xs muted">Up to 20 matches are returned. Refine the search to find the exact student.</p>}
          <Field label="Trial student"><Select value={memberId} onChange={e => setMemberId(e.target.value)}><option value="">Choose the exact student</option>
            {context.students.map(s => <option key={s.id} value={s.id} disabled={!['lead', 'trial'].includes(s.state)}>{s.name} · {s.memberNumber || `ID ${s.id}`} · {s.state}{!['lead', 'trial'].includes(s.state) ? ' — not eligible for trial booking' : ''}</option>)}
          </Select></Field>
          <Field label="Trial class" hint="Times are shown in this device’s time zone. Odoo rechecks availability on confirmation."><Select value={sessionId} onChange={e => setSessionId(e.target.value)}><option value="">Choose an upcoming class</option>
            {context.sessions.map(s => <option key={s.id} value={s.id} disabled={s.capacity > 0 && s.registered >= s.capacity}>{s.title} · {new Date(s.startsAt).toLocaleString()} · {s.registered} registered{s.capacity > 0 ? ` / ${s.capacity} capacity` : ''}{s.capacity > 0 && s.registered >= s.capacity ? ' · full' : ''}{s.courseRoster ? ' · course roster' : ''}</option>)}
          </Select></Field>
          {context.sessions.length === 0 && <p role="status" className="text-sm muted">Odoo returned no upcoming trial classes.</p>}
          {context.sessions.length === 100 && <p className="text-xs muted">This read returns up to 100 classes in the next 60 days.</p>}
          <Field label="Reason for this trial"><Textarea value={reason} maxLength={500} onChange={e => setReason(e.target.value)} /></Field>
        </>}
        {context.trials.length > 0 && <details><summary className="cursor-pointer text-sm">Recorded trials in this read ({context.trials.length})</summary>
          <ul className="mt-2 space-y-2 text-sm">{context.trials.map(t => <li key={t.id}>{t.member.name} · {t.session.title} · <TimeLabel iso={t.session.startsAt} /> · {STATES[t.state]}</li>)}</ul>
        </details>}
      </>}
    </div>}
    {context?.stageAutomations && context.stageAutomations.length > 0 && <p className="mt-4 text-xs muted">Active CRM automations were reported by Odoo. This action leaves the CRM stage unchanged.</p>}
    {status === 'uncertain' && <p role="status" className="mt-4 text-sm text-(--crm-warning)">Reservation not confirmed. It may have reached Odoo. Retry preserves the same student, class, versions and request key.</p>}
  </Modal></div>;
}
