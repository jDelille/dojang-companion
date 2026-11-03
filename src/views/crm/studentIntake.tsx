'use client';

// Adapted to Dojang from Companion StudentIntake's reviewed native-record workflow.
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import type { CreateStudentPayload, Guardian, Intake, IntakeContext, IntakePreview, StudentReceipt } from '@/domain/studentIntake';
import { explainHubError, newRequestKey } from '@/domain/hubAction';
import { getIntakeContext, previewStudent } from '@/integrations/studentIntake';
import { createStudent } from '@/integrations/crmWrites';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Input, Select } from '@/templates/roster/components/ui/form';
import { Modal } from '@/templates/roster/components/ui/overlay';

type Success = { receipt: StudentReceipt; name: string };
export default function StudentIntake({ onClose, onCreated, destination = 'trial' }: { onClose: () => void; onCreated: (value: Success) => void; destination?: 'trial' | 'profile' }) {
  const [context, setContext] = useState<IntakeContext | null>(null);
  const [query, setQuery] = useState(''), [search, setSearch] = useState(''), [reload, setReload] = useState(0);
  const [kind, setKind] = useState<'adult' | 'child'>('adult');
  const [guardianKind, setGuardianKind] = useState('new'), [guardianId, setGuardianId] = useState('');
  const [matched, setMatched] = useState<Guardian[]>([]);
  const [preview, setPreview] = useState<IntakePreview | null>(null);
  const [confirmed, setConfirmed] = useState(false), [error, setError] = useState('');
  const [status, setStatus] = useState<'editing' | 'checking' | 'review' | 'pending' | 'uncertain' | 'saved'>('editing');
  const [success, setSuccess] = useState<Success | null>(null);
  const frozen = useRef<{ payload: CreateStudentPayload; key: string } | null>(null);
  const mounted = useRef(true), inFlight = useRef(false);
  const resetSession = useStaffSessionReset(), markSignedOut = useMarkSignedOut();
  const sessionLost = useRef(() => { resetSession(); markSignedOut(); onClose(); });
  useLayoutEffect(() => { sessionLost.current = () => { resetSession(); markSignedOut(); onClose(); }; }, [resetSession, markSignedOut, onClose]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void getIntakeContext(search, controller.signal).then(result => {
      if (cancelled) return;
      if (result.outcome === 'loaded') { setContext(result.value); setStatus('editing'); }
      else {
        if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(result.code)) { sessionLost.current(); return; }
        setContext(null); setError(result.code); setStatus('editing');
      }
    });
    return () => { cancelled = true; controller.abort(); };
  }, [search, reload]);
  const locked = status === 'pending' || status === 'uncertain';
  const reviewing = status === 'review' || locked;
  const blocked = status !== 'editing';
  const guardians = context ? [...matched.filter(g => !context.guardians.some(c => c.id === g.id)), ...context.guardians] : [];
  function authLost(code: string) {
    if (!['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) return false;
    resetSession(); markSignedOut(); onClose(); return true;
  }
  function close() { if (!inFlight.current && !locked) onClose(); }
  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked || inFlight.current || !context) return;
    const data = new FormData(event.currentTarget);
    const get = (field: string) => String(data.get(field) || '').trim();
    const selected = guardians.find(g => g.id === guardianId);
    const intake: Intake = { studentType: kind, student: { name: get('name'), email: get('email'), phone: get('phone'), dateOfBirth: get('birth'), gender: get('gender') as Intake['student']['gender'] },
      guardian: kind === 'adult' ? null : guardianKind === 'new' ? { kind: 'new', name: get('guardianName'), email: get('guardianEmail'), phone: get('guardianPhone') } : selected ? { kind: 'existing', partnerId: selected.id, householdId: selected.householdId, expectedVersion: selected.version, expectedHouseholdVersion: selected.householdVersion } : null,
      reviewRef: get('reviewRef') };
    inFlight.current = true; setStatus('checking'); setError(''); setPreview(null);
    const result = await previewStudent(intake);
    inFlight.current = false;
    if (!mounted.current) return;
    if (result.outcome === 'unavailable') { if (!authLost(result.code)) { setError(result.code); setStatus('editing'); } return; }
    setPreview(result.value); setConfirmed(false); setStatus(result.value.valid ? 'review' : 'editing');
  }
  async function save() {
    if (inFlight.current || !preview?.valid || !confirmed || (status !== 'review' && status !== 'uncertain')) return;
    frozen.current ??= { payload: { intake: preview.intake, reviewToken: preview.reviewToken }, key: newRequestKey() };
    inFlight.current = true; setStatus('pending'); setError('');
    const answer = await createStudent(frozen.current.payload, frozen.current.key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === 'notConfirmed') { setStatus('uncertain'); return; }
    frozen.current = null;
    if (answer.outcome === 'failed') {
      if (!authLost(answer.code)) { setError(answer.code); setPreview(null); setConfirmed(false); setStatus('editing'); }
      return;
    }
    setSuccess({ receipt: answer.result, name: preview.intake.student.name }); setStatus('saved');
  }
  return <div className="roster-scope"><Modal open onClose={close} title="Create prospective student" width="lg"
    description={destination === 'trial' ? 'Create a reviewed Odoo profile, then return to this lead’s trial booking.' : 'Create a reviewed prospective-student profile in Odoo, then open their record.'}
    footer={<><Button type="button" variant="ghost" disabled={locked || status === 'checking'} onClick={close}>{success ? 'Close' : destination === 'trial' ? 'Back to trial booking' : 'Back to People'}</Button>
      {status === 'review' && <Button type="button" onClick={() => { setPreview(null); setConfirmed(false); setStatus('editing'); }}>Back to edit</Button>}
      {reviewing && <Button type="button" variant="primary" disabled={!confirmed || status === 'pending'} onClick={() => void save()}>{status === 'pending' ? 'Waiting for Odoo…' : status === 'uncertain' ? 'Retry same creation' : 'Confirm student creation'}</Button>}
      {success && <Button type="button" variant="primary" onClick={() => onCreated(success)}>{destination === 'trial' ? 'Continue to trial booking' : 'Open student profile'}</Button>}</>}>
    {error && <div role="alert" className="mb-4 text-sm"><p>{error === 'VERSION_CONFLICT' ? 'The selected guardian or household changed. Search households and review the selection again.' : explainHubError(error)}</p>{!context && <Button type="button" onClick={() => { setError(''); setReload(n => n + 1); }}>Reload intake options</Button>}</div>}
    {!context && !error && <p role="status">Loading intake options…</p>}
    {context && <form onSubmit={review} hidden={reviewing || !!success} className="space-y-4">
      <p className="text-sm muted">School: {context.school}. Check the student’s identity before creating a new profile.</p>
      <fieldset disabled={blocked} className="space-y-4"><legend className="mb-2 font-semibold">Student details</legend>
        <Field label="Student type"><Select value={kind} onChange={e => { setKind(e.target.value as 'adult' | 'child'); setPreview(null); }}><option value="adult">Adult (18 or older)</option><option value="child">Child (under 18)</option></Select></Field>
        <Field label="Student full name"><Input name="name" required maxLength={200} autoComplete="off" /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Date of birth"><Input type="date" name="birth" required max={context.today} /></Field>
          <Field label="Gender (optional)"><Select name="gender"><option value="">Leave unrecorded</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></Select></Field>
          <Field label="Student email"><Input type="email" name="email" maxLength={200} /></Field><Field label="Student phone"><Input type="tel" name="phone" maxLength={40} /></Field></div>
        <p className="text-xs muted">{kind === 'adult' ? 'Enter at least one contact method: email or phone.' : 'Child contact details are optional. Enter the adult’s details under Guardian.'}</p>
        {kind === 'child' && <section className="space-y-4" aria-label="Guardian and household"><h3 className="font-semibold">Guardian and household</h3>
          <Field label="Guardian selection"><Select value={guardianKind} onChange={e => { setGuardianKind(e.target.value); setGuardianId(''); }}><option value="new">Create a new guardian and household</option><option value="existing">Use an existing guardian and household</option></Select></Field>
          {guardianKind === 'new' ? <><Field label="Guardian full name"><Input name="guardianName" required maxLength={200} /></Field><Field label="Guardian email"><Input type="email" name="guardianEmail" maxLength={200} /></Field><Field label="Guardian phone"><Input type="tel" name="guardianPhone" maxLength={40} /></Field><p className="text-xs muted">Enter the guardian’s email or phone.</p></> : <>
            <Field label="Find guardian or household"><Input value={query} maxLength={100} onChange={e => setQuery(e.target.value)} /></Field>
            <Button type="button" onClick={() => { setStatus('checking'); setGuardianId(''); setMatched([]); setSearch(query.trim()); setReload(n => n + 1); }}>Search households</Button>
            <Field label="Existing guardian"><Select required value={guardianId} onChange={e => setGuardianId(e.target.value)}><option value="">Select the exact guardian and household</option>{guardians.map(g => <option key={g.id} value={g.id}>{g.name} · {g.household} · ID {g.id}</option>)}</Select></Field>
            {context.moreGuardians && <p className="text-xs muted">Up to 50 matching guardians are shown. Narrow the search if needed.</p>}
            {!guardians.length && <p className="text-xs muted">No selectable guardian households were returned. Records with missing household links need review in Odoo.</p>}
          </>}
        </section>}
        <Field label="Identity and guardian review reference" hint="Reference the completed identity check and, for a child, guardian-authority check. Do not enter documents or passwords."><Input name="reviewRef" required maxLength={300} /></Field>
        <Button type="submit" variant="primary">{status === 'checking' ? 'Checking intake…' : 'Review new student'}</Button>
      </fieldset>
    </form>}
    {preview && !preview.valid && <section role="alert" className="mt-4 space-y-2 text-sm"><h3 className="font-semibold">Review existing records and intake details</h3><ul className="list-disc pl-5">{preview.issues.map((i, n) => <li key={n}>{i.message}</li>)}</ul>
      {preview.duplicateStudents.map(s => <p key={s.memberId}>{s.active ? <Link className="underline" href={`/people/${s.memberId}`}>Open existing student: {s.name} · {s.memberNumber}</Link> : `${s.name} · ${s.memberNumber} is archived. An administrator must review the existing profile in Odoo.`}</p>)}
      {preview.guardianMatches.map(g => <Button key={g.id} type="button" onClick={() => { setMatched(old => [g, ...old.filter(m => m.id !== g.id)]); setGuardianKind('existing'); setGuardianId(g.id); setPreview(null); }}>Use {g.name} · {g.household}</Button>)}
      {preview.unselectableGuardianMatch && <p>A matching contact needs administrator review in Odoo.</p>}<p>Nothing has been created.</p></section>}
    {reviewing && preview?.valid && <section className="space-y-3 text-sm" aria-label="Student creation review"><h3 className="font-semibold">Review prospective student</h3>
      <p>{preview.intake.student.name} · {preview.intake.student.dateOfBirth} · {preview.intake.studentType}</p>
      <p>Gender: {preview.intake.student.gender || 'Left unrecorded'}</p>
      <p>Student contact: {preview.intake.student.email || 'Email left blank'} · {preview.intake.student.phone || 'Phone left blank'}</p>
      {preview.guardianName && <p>Guardian: {preview.guardianName} · {preview.householdName || 'New household'}</p>}
      {preview.intake.guardian?.kind === 'existing' && <p>Guardian ID {preview.intake.guardian.partnerId} · Household ID {preview.intake.guardian.householdId}</p>}
      {preview.intake.guardian?.kind === 'new' && <p>Guardian contact: {preview.intake.guardian.email || 'Email left blank'} · {preview.intake.guardian.phone || 'Phone left blank'}</p>}
      <p>Review reference: {preview.intake.reviewRef}</p>
      <p>Creates a student in lead state{preview.intake.guardian?.kind === 'new' ? ', plus a new guardian and household' : preview.intake.guardian ? ', linked to the selected guardian’s household' : ''}.{destination === 'trial' ? ' Trial reservation will connect this student and the CRM lead in a separate confirmation.' : ' This profile creation does not create or link a CRM lead.'}</p>
      <p className="muted">No paid membership, class reservation, attendance, waiver signature, portal access, or message is created.</p>
      <label className="flex gap-2"><input type="checkbox" checked={confirmed} disabled={locked} onChange={e => setConfirmed(e.target.checked)} />I checked the identity{kind === 'child' ? ' and guardian authority' : ''} and reviewed these details.</label>
    </section>}
    {status === 'uncertain' && <p role="status" className="mt-4 text-sm">Creation is not confirmed and may have reached Odoo. Retry uses the same reviewed details and request key. Do not create another profile.</p>}
    {success && <section role="status" className="space-y-3 text-sm"><h3 className="font-semibold">Student created in Odoo</h3><p>{success.name} · {success.receipt.memberNumber} · Student ID {success.receipt.memberId}{success.receipt.replayed ? ' · Original request confirmed' : ''}</p><p>{destination === 'trial' ? 'Continue to select this student for the trial. The CRM lead is connected when the reservation is confirmed.' : 'Open this student’s profile using the confirmed Odoo ID. Their recorded state is lead; no CRM lead was created or linked.'}</p><p className="muted">No membership, class reservation, portal access, or message was created.</p></section>}
  </Modal></div>;
}
