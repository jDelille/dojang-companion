'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { object, recordId, nonnegative, string, type MemberCommand } from '@/domain/memberActions';
import { memberToolContextFrom, bookableSessionsFrom, memberExtraAllowed, type MemberToolContext, type BookableSession } from '@/domain/memberToolContext';
import { memberRead } from '@/integrations/memberActions';
import { explainHubError } from '@/domain/hubAction';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import { Modal } from '@/templates/roster/components/ui/overlay';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Input, Select, Textarea } from '@/templates/roster/components/ui/form';
import MemberActionDialog, { type PreparedMemberAction } from './memberActionDialog';
import SignaturePad from './signaturePad';
import '@/templates/roster/roster.css';

export type MemberTool = 'edit' | 'photo' | 'book' | 'change' | 'checkout' | 'rank' | 'payment' | 'archive' | 'attendance' | 'guardian' | 'pin' | 'consent' | 'waiver' | 'course';
export const TOOL_LABELS: Record<MemberTool, string> = { edit: 'Edit student', photo: 'Student photo', book: 'Book a class', change: 'Change a class booking', checkout: 'Check out of class', rank: 'Award rank / stripes', payment: 'Invoice checkout', archive: 'Archive student', attendance: 'Record staff attendance', guardian: 'Verify guardian messaging channel', pin: 'Guardian kiosk access', consent: 'Communication consent', waiver: 'Review / sign waiver', course: 'Manage course roster' };
const rows = (v: unknown): Record<string, unknown>[] | null => Array.isArray(v) && v.every(object) ? v : null;
const options = (v: unknown, idKey = 'id') => rows(v)?.filter(r => recordId(r[idKey]) && string(r.name)) ?? [];
const when = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v)) ? new Date(v).toLocaleString() : 'Time unavailable';
export default function MemberTools({ memberId, tool, onClose, onAuthenticationLost }: { memberId: string; tool: MemberTool; onClose: () => void; onAuthenticationLost: () => void }) {
  const router = useRouter();
  const [data, setData] = useState<MemberToolContext | null>(null), [extra, setExtra] = useState<Record<string, unknown> | null>(null);
  const [sessions, setSessions] = useState<BookableSession[]>([]), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [targetId, setTargetId] = useState(''), [sheet, setSheet] = useState<Record<string, unknown> | null>(null), [sheetBusy, setSheetBusy] = useState(false);
  const [prepared, setPrepared] = useState<PreparedMemberAction | null>(null), [busy, setBusy] = useState(false), [signature, setSignature] = useState('');
  const alive = useRef(true), photo = useRef<string | null>(null), inFlight = useRef(false);
  const targetRequest = useRef(0);
  const archived = useRef(false);
  const reset = useStaffSessionReset(), markSignedOut = useMarkSignedOut();
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const read = async (op: string, payload: Record<string, unknown>) => {
      const answer = await memberRead(op, payload, controller.signal);
      if (answer.outcome !== 'done') throw Error(answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE');
      return answer.result;
    };
    void (async () => {
      const raw = await read('member_details', { memberId });
      const parsed = memberToolContextFrom(raw, memberId);
      if (!parsed) throw Error('HUB_RESPONSE_UNREADABLE');
      const manage = !['attendance', 'checkout', 'book', 'change', 'photo'].includes(tool);
      if (manage && !parsed.canEdit) throw Error('FORBIDDEN');
      if (['edit', 'photo'].includes(tool) && !parsed.canEditContact) throw Error('SHARED_CONTACT_REVIEW_REQUIRED');
      let aux: Record<string, unknown> | null = null, available: BookableSession[] = [];
      if (tool === 'book' || tool === 'change') { const parsedSessions = bookableSessionsFrom(await read('context', {}), memberId); if (!parsedSessions) throw Error('HUB_RESPONSE_UNREADABLE'); available = parsedSessions; }
      const reads: Partial<Record<MemberTool, string>> = { attendance: 'attendance_sessions', archive: 'archive_review', pin: 'guardian_kiosk_access', consent: 'consent_overview', waiver: 'waiver_context', guardian: 'member_workspace', course: 'course_roster' };
      const op = reads[tool];
      if (op) aux = await read(op, tool === 'attendance' ? {} : tool === 'course' ? { templateId: null } : tool === 'guardian' ? { memberId, section: 'family' } : { memberId });
      if (aux && !memberExtraAllowed(tool, aux, memberId)) throw Error('HUB_RESPONSE_UNREADABLE');
      if (!cancelled) { setData(parsed); setExtra(aux); setSessions(available); }
    })().catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'BACKEND_UNAVAILABLE'); });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, tool, reload]);
  function refresh() { targetRequest.current += 1; setSheetBusy(false); setData(null); setExtra(null); setError(''); setSheet(null); setTargetId(''); setSignature(''); setReload(n => n + 1); }
  const selected = sessions.find(s => s.id === targetId);
  const attendanceRow = rows(sheet?.rows)?.find(r => r.memberId === memberId);
  const consentContact = options(extra?.contacts, 'partnerId').find(c => c.partnerId === targetId);
  const family = object(extra?.data) ? extra.data : null;
  const guardOptions = options(family?.householdGuardians);
  async function loadTarget(id: string) {
    const request = ++targetRequest.current;
    setTargetId(id); setSheet(null); setError('');
    if (!id || !['attendance', 'course'].includes(tool)) { setSheetBusy(false); return; }
    setSheetBusy(true);
    const answer = await memberRead(tool === 'attendance' ? 'attendance_sheet' : 'course_roster', tool === 'attendance' ? { sessionId: id } : { templateId: id });
    if (!alive.current || request !== targetRequest.current) return;
    setSheetBusy(false);
    // Ignore a response for a different selection; the effect below keeps identity in the data too.
    if (answer.outcome !== 'done') setError(answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE');
    else if (tool === 'course' && !memberExtraAllowed('course', answer.result, memberId)) setError('HUB_RESPONSE_UNREADABLE');
    else if (tool === 'attendance' && (!object(answer.result.session) || answer.result.session.id !== id || typeof answer.result.session.open !== 'boolean' || !rows(answer.result.rows) || rows(answer.result.rows)!.some(r => !recordId(r.memberId) || !nonnegative(r.version) || !string(r.status)))) setError('HUB_RESPONSE_UNREADABLE');
    else setSheet(answer.result);
  }
  const sheetMatches = tool === 'attendance' ? object(sheet?.session) && sheet.session.id === targetId : object(sheet?.course) && sheet.course.id === targetId;
  function review(command: MemberCommand, effects: string[], evidence: { label: string; value: string }[]) {
    if (!data) return;
    setPrepared({ command, title: TOOL_LABELS[tool], effects, evidence: [{ label: 'Student', value: `${data.member.name} · ID ${memberId}` }, ...evidence] });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || busy || inFlight.current) return;
    setError('');
    const f = new FormData(event.currentTarget), get = (key: string) => String(f.get(key) ?? '').trim();
    const base = { memberId, expectedVersion: data.member.version };
    const evidence = (label: string, value: string) => ({ label, value });
    if (tool === 'edit') {
      const changes: Record<string, string> = {};
      for (const field of ['name', 'email', 'phone'] as const) if (get(field) !== (data.member[field] ?? '')) changes[field] = get(field);
      if (!Object.keys(changes).length) { setError('NO_CHANGES'); return; }
      review({ operation: 'update_member', payload: { ...base, expectedPartnerVersion: data.member.partnerVersion, changes } }, ['Updates only the reviewed contact fields on the native Odoo profile. Membership state, rank and billing are unchanged.'], Object.entries(changes).map(([k, v]) => evidence(k, `${data.member[k as 'name' | 'email' | 'phone'] || '(blank)'} → ${v || '(clear field)'}`)));
    } else if (tool === 'book' || tool === 'change') {
      if (!selected) return;
      const from = data.bookings.find(b => b.sessionId === get('from') && b.replaceable);
      if (tool === 'change' && (!from || from.sessionId === selected.id)) { setError('ENROLLMENT_REVIEW_REQUIRED'); return; }
      review({ operation: tool === 'book' ? 'book' : 'change_class', payload: { memberId, sessionId: selected.id, expectedVersion: selected.version, ...(from ? { fromSessionId: from.sessionId } : {}) } }, [tool === 'book' ? 'Registers the student in this class.' : 'Cancels the previous registration and creates the new one in one Odoo transaction.', 'Odoo checks membership, credits, course roster, session state and capacity. This is regular class booking; trial reservations use the lead workflow. No message is sent by this command.'], [evidence('Class', `${selected.title} · ${when(selected.startsAt)} · ID ${selected.id}`), ...(from ? [evidence('Previous class', `${from.title} · ${when(from.startsAt)}`)] : [])]);
    } else if (tool === 'checkout') {
      const log = data.attendance.find(a => a.id === get('attendance') && a.checkedOutAt === null);
      if (!log) return;
      review({ operation: 'checkout', payload: { memberId, sessionId: log.sessionId } }, ['Records checkout on the existing attendance entry. This does not create a check-in or a reservation.'], [evidence('Class', `${log.title} · Class ID ${log.sessionId}`), evidence('Checked in', when(log.checkedInAt))]);
    } else if (tool === 'rank') {
      const rank = data.ranks.find(r => r.id === get('rankId')), stripes = Number(get('stripes'));
      if (!rank || !nonnegative(stripes) || stripes > rank.maxStripes) { setError('INVALID_RANK'); return; }
      review({ operation: 'rank', payload: { ...base, rankId: rank.id, stripes, reason: get('reason') } }, ['Creates a rank-history award and updates the student’s recorded rank/stripes. This direct staff award is separate from the testing-roster promotion workflow.'], [evidence('Award', `${rank.name} · ${stripes} stripes`), evidence('Reason', get('reason'))]);
    } else if (tool === 'payment') {
      const invoice = data.invoices.find(i => i.id === get('invoice') && i.kind === 'out_invoice' && i.remaining > 0 && i.paymentUnavailable === null);
      if (!invoice) return;
      review({ operation: 'payment_link', payload: { memberId, invoiceId: invoice.id, expectedVersion: invoice.version, expectedAmount: invoice.remaining } }, ['Generates a signed checkout link for the exact invoice and remaining amount. It does not charge a card, send the link, or mark anything paid.', ...(invoice.scope === 'household' ? ['This is a shared household invoice and may cover other students.'] : [])], [evidence('Invoice', `${invoice.number} · ${invoice.scope}`), evidence('Remaining amount', `${invoice.remaining} ${invoice.currency}`)]);
    } else if (tool === 'archive' && extra) {
      if (!nonnegative(extra.version) || !Array.isArray(extra.blockers) || extra.blockers.length) { setError('ARCHIVE_REVIEW_REQUIRED'); return; }
      review({ operation: 'archive_member', payload: { memberId, expectedVersion: extra.version, reason: get('reason') } }, [`Archives the student and cancels ${String(extra.futureBookingCount)} future registered bookings. Existing attendance, rank and billing history remain in Odoo.`, 'Course-roster assignments are retained. Restoring the profile does not restore cancelled bookings.'], [evidence('Reason', get('reason')), evidence('Open memberships', String(extra.openMemberships)), evidence('Portal accounts', String(extra.portalAccounts))]);
    } else if (tool === 'attendance' && sheetMatches && object(sheet?.session) && sheet.session.open === true && attendanceRow && nonnegative(attendanceRow.version)) {
      const status = get('status');
      if (status === attendanceRow.status) { setError('ATTENDANCE_UNCHANGED'); return; }
      review({ operation: 'mark_attendance', payload: { memberId, sessionId: targetId, expectedVersion: attendanceRow.version, status, reason: get('reason') } }, ['Records or corrects staff attendance on this specific class. Odoo enforces the attendance window, eligibility, correction/reversal permissions and credit-hold rules.', 'This does not claim kiosk check-in or update a CRM trial outcome. For a booked trial, use its lead’s trial-attendance workflow.'], [evidence('Class', `${String(sheet.session.title)} · ${when(sheet.session.startsAt)}`), evidence('Attendance', `${String(attendanceRow.status)} → ${status}`), evidence('Reason', get('reason'))]);
    } else if (tool === 'guardian') {
      const guardian = guardOptions.find(g => g.id === get('guardian'));
      if (!guardian) return;
      review({ operation: 'link_guardian', payload: { partnerId: guardian.id, memberIds: [memberId], channel: get('channel'), contactRef: get('contactRef'), verificationRef: get('reason'), allowReply: f.get('allowReply') === 'on' } }, ['Creates a staff-verified messaging binding for the selected household guardian and this student. Household membership alone is not channel verification or marketing consent.', 'No invitation or message is sent.'], [evidence('Guardian', String(guardian.name)), evidence('Channel / provider contact', `${get('channel')} · ${get('contactRef')}`), evidence('Verification reference', get('reason')), evidence('Replies allowed', f.get('allowReply') === 'on' ? 'Yes' : 'No')]);
    } else if (tool === 'pin') {
      const g = options(extra?.guardians).find(g => g.id === get('guardian'));
      if (!g) return;
      const revoke = get('action') === 'revoke';
      review({ operation: revoke ? 'revoke_guardian_kiosk_pin' : 'set_guardian_kiosk_pin', payload: { memberId, guardianId: g.id, reason: get('reason'), ...(!revoke ? { pin: get('pin') } : {}) } }, [revoke ? 'Revokes this guardian’s kiosk PIN and existing guardian kiosk sessions.' : 'Sets a six-digit guardian kiosk PIN. It applies to the guardian’s household students; it is not a staff sign-in.', 'No message is sent; the PIN is never included in receipts.'], [evidence('Guardian', String(g.name)), evidence('Action', revoke ? 'Revoke access' : 'Set PIN (hidden)'), evidence('Reason', get('reason'))]);
    } else if (tool === 'consent' && consentContact) {
      review({ operation: 'record_consent', payload: { memberId, partnerId: consentContact.partnerId, channel: get('channel'), purpose: get('purpose'), state: get('state'), source: get('source'), evidence: get('reason') } }, ['Records the selected contact’s communication consent and its evidence. Marketing opt-in/out also updates Odoo’s native email or phone blacklist as applicable.', 'Consent is recorded from the evidence supplied; this action does not send a message.'], [evidence('Contact', String(consentContact.name)), evidence('Consent', `${get('channel')} · ${get('purpose')} · ${get('state')}`), evidence('Source / evidence', `${get('source')} · ${get('reason')}`)]);
    } else if (tool === 'waiver' && extra && nonnegative(extra.version)) {
      const signer = options(extra.signers, 'partnerId').find(s => s.partnerId === get('signer'));
      if (!signer || !signature) { setError('SIGNATURE_EMPTY'); return; }
      review({ operation: 'sign_waiver', payload: { memberId, expectedVersion: extra.version, signerPartnerId: signer.partnerId, signedByName: get('signedBy'), contentVersion: extra.contentVersion, agreed: f.get('agreed') === 'on', signature } }, ['Stores the actual signer’s drawn signature against the current waiver text, marks the waiver signed, and stores a PDF when supported. Your staff account is recorded as witness.', 'A guardian must personally sign for a child. Do not draw a signature on someone else’s behalf. No message is sent.'], [evidence('Document', String(extra.title)), evidence('Signer', `${String(signer.name)} · ${String(signer.relationship)}`), evidence('Signed name', get('signedBy'))]);
    } else if (tool === 'course' && sheetMatches && object(sheet?.course)) {
      const remove = get('action') === 'remove';
      inFlight.current = true; setBusy(true);
      const answer = await memberRead('course_assignment_preview', { templateId: targetId, addMemberIds: remove ? [] : [memberId], removeMemberIds: remove ? [memberId] : [] });
      inFlight.current = false; setBusy(false);
      if (!alive.current) return;
      if (answer.outcome !== 'done') { setError(answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'); return; }
      const plan = answer.result;
      if (plan.valid !== true || !nonnegative(plan.version) || !string(plan.reviewToken) || !rows(plan.add) || !rows(plan.remove) || !Array.isArray(plan.capacityConflicts) || plan.capacityConflicts.length) { setError('CAPACITY_REVIEW_REQUIRED'); return; }
      const planned = [...rows(plan.add)!, ...rows(plan.remove)!];
      if (planned.length !== 1 || planned[0].memberId !== memberId || plan.templateId !== targetId) { setError('HUB_RESPONSE_UNREADABLE'); return; }
      review({ operation: 'assign_course_members', payload: { templateId: targetId, expectedVersion: plan.version, addMemberIds: remove ? [] : [memberId], removeMemberIds: remove ? [memberId] : [], reason: get('reason'), reviewToken: plan.reviewToken } }, [`${remove ? 'Removes' : 'Adds'} this student ${remove ? 'from' : 'to'} the course roster.`, `This also ${remove ? `cancels ${String(planned[0].cancelledBookings)} future bookings` : `creates ${String(planned[0].futureBookings)} future bookings according to the course’s auto-enrollment policy`}. Odoo rechecks the reviewed plan and capacity before commit.`], [evidence('Course', String(sheet.course.name)), evidence('Reason', get('reason'))]);
    }
  }
  async function choosePhoto(file: File | undefined) {
    if (!file || !data || busy) return;
    setBusy(true); setError('');
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) throw Error('PHOTO_TYPE_UNSUPPORTED');
      const bitmap = await createImageBitmap(file);
      if (Math.min(bitmap.width, bitmap.height) < 64) { bitmap.close(); throw Error('PHOTO_DIMENSIONS'); }
      const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height)), canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext('2d'); if (!ctx) { bitmap.close(); throw Error('PHOTO_INVALID'); }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      photo.current = canvas.toDataURL('image/jpeg', .85).split(',')[1];
      if (!photo.current || photo.current.length > 400000) throw Error('PHOTO_TOO_LARGE');
      if (alive.current) review({ operation: 'update_member_photo', payload: { memberId, expectedVersion: data.member.version, image: photo.current } }, ['Replaces this student’s native Odoo contact photo. Odoo checks shared-contact rules and the member version.'], [{ label: 'New photo', value: `${canvas.width} × ${canvas.height} JPEG from ${file.name}` }]);
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : 'PHOTO_INVALID'); }
    finally { if (alive.current) setBusy(false); }
  }
  useLayoutEffect(() => { if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(error)) { reset(); markSignedOut(); onAuthenticationLost(); } }, [error, reset, markSignedOut, onAuthenticationLost]);
  if (prepared) return <MemberActionDialog prepared={prepared} onAuthenticationLost={onAuthenticationLost} onClose={() => { if (archived.current) { router.push('/people'); router.refresh(); onClose(); } else { setPrepared(null); refresh(); } }} onSaved={result => { if (result.state === 'archived') archived.current = true; else router.refresh(); }} />;
  const canSubmit = !!data && !busy && !sheetBusy && !error && (tool !== 'attendance' || (sheetMatches && object(sheet?.session) && sheet.session.open === true && !!attendanceRow)) && (tool !== 'course' || sheetMatches);
  return <div className="roster-scope"><Modal open onClose={() => { if (!busy) onClose(); }} title={TOOL_LABELS[tool]} width="lg" footer={<><Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Close</Button><Button type="button" disabled={busy} onClick={refresh}>Reload current record</Button></>}>
    {error && <p role="alert" className="mb-4 text-sm">{explainHubError(error)} · {error}</p>}
    {!data && !error && <p role="status">Loading current Odoo record…</p>}
    {data && <form onSubmit={e => void submit(e)} className="space-y-4"><p className="text-sm font-semibold">{data.member.name} · Student #{memberId}</p><fieldset disabled={busy} className="space-y-4">
      {tool === 'edit' && <>{(['name', 'email', 'phone'] as const).map(field => <Field key={field} label={field === 'name' ? 'Full name' : field === 'email' ? 'Email' : 'Phone'}><Input name={field} defaultValue={data.member[field] ?? ''} required={field === 'name'} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} maxLength={200} /></Field>)}</>}
      {(tool === 'book' || tool === 'change') && <>{tool === 'change' && <Field label="Current booking"><Select name="from" required><option value="">Choose the booking to replace</option>{data.bookings.filter(b => b.replaceable).map(b => <option key={b.sessionId} value={b.sessionId}>{b.title} · {when(b.startsAt)}</option>)}</Select></Field>}<Field label="Upcoming class"><Select required value={targetId} onChange={e => setTargetId(e.target.value)}><option value="">Choose an authorized class</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.title} · {when(s.startsAt)}</option>)}</Select></Field><p className="text-xs muted">The scoped context returns up to 100 sessions. Odoo checks eligibility and capacity on confirmation. This read does not provide a full eligibility preview.</p>{!sessions.length && <p>No upcoming classes were returned.</p>}</>}
      {tool === 'checkout' && <Field label="Open attendance entry"><Select name="attendance" required><option value="">Choose an existing check-in</option>{data.attendance.filter(a => a.checkedOutAt === null).map(a => <option key={a.id} value={a.id}>{a.title} · Checked in {when(a.checkedInAt)}</option>)}</Select></Field>}
      {tool === 'rank' && <><Field label="Rank"><Select name="rankId" required><option value="">Choose a configured rank</option>{data.ranks.map(r => <option key={r.id} value={r.id}>{r.name} · Up to {r.maxStripes} stripes</option>)}</Select></Field><Field label="Stripes"><Input name="stripes" type="number" min={0} step={1} required defaultValue={0} /></Field></>}
      {tool === 'photo' && <><Field label="New student photo"><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void choosePhoto(e.target.files?.[0])} /></Field><p className="text-xs muted">The image is resized to at most 512 pixels before review.</p>{data.member.photo && <Button type="button" onClick={() => review({ operation: 'update_member_photo', payload: { memberId, expectedVersion: data.member.version, image: null } }, ['Removes the native contact photo.'], [])}>Review photo removal</Button>}</>}
      {tool === 'payment' && <><Field label="Invoice"><Select name="invoice" required><option value="">Choose a payable invoice</option>{data.invoices.map(i => <option key={i.id} value={i.id} disabled={i.kind !== 'out_invoice' || i.remaining <= 0 || i.paymentUnavailable !== null}>{i.number} · {i.remaining} {i.currency} · {i.scope}{i.paymentUnavailable ? ` · ${explainHubError(i.paymentUnavailable)}` : ''}</option>)}</Select></Field>{!data.invoices.length && <p>No linked posted invoices were returned.</p>}<p className="text-xs muted">Review creates an Odoo checkout link; payment happens on Odoo’s secure invoice page.</p></>}
      {tool === 'archive' && extra && <section className="space-y-2 text-sm"><p>Future bookings to cancel: {String(extra.futureBookingCount)}</p><p>Open memberships: {String(extra.openMemberships)} · Portal accounts: {String(extra.portalAccounts)}</p>{Array.isArray(extra.blockers) && extra.blockers.map((b, i) => <p key={i} role="alert">{explainHubError(String(b))}</p>)}</section>}
      {tool === 'attendance' && <><Field label="Class"><Select required value={targetId} onChange={e => void loadTarget(e.target.value)}><option value="">Choose a class in the attendance window</option>{rows(extra?.sessions)?.filter(s => recordId(s.id) && string(s.title)).map(s => <option key={String(s.id)} value={String(s.id)}>{String(s.title)} · {when(s.startsAt)}</option>)}</Select></Field>{sheetBusy && <p role="status">Reading the class attendance sheet…</p>}{sheetMatches && <p className="text-sm">{attendanceRow ? `Current attendance: ${String(attendanceRow.status)}${attendanceRow.logId ? ' · Existing log; correction permissions apply' : ''}` : 'This student is not on the returned class roster.'}</p>}<Field label="Record as"><Select name="status" required>{['present', 'late', 'absent', 'excused'].map(s => <option key={s} value={s}>{s}</option>)}</Select></Field><p className="text-xs muted">This is a staff attendance action, separate from public kiosk check-in and CRM trial outcomes.</p></>}
      {tool === 'guardian' && <><Field label="Household guardian"><Select name="guardian" required><option value="">Select the exact guardian</option>{guardOptions.map(g => <option key={String(g.id)} value={String(g.id)}>{String(g.name)} · ID {String(g.id)}</option>)}</Select></Field><Field label="Channel"><Select name="channel"><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option></Select></Field><Field label="Verified provider contact reference"><Input name="contactRef" maxLength={128} required /></Field><label className="flex gap-2 text-sm"><input type="checkbox" name="allowReply" />Allow replies through this verified binding</label></>}
      {tool === 'pin' && <><Field label="Household guardian"><Select name="guardian" required><option value="">Select guardian</option>{options(extra?.guardians).map(g => <option key={String(g.id)} value={String(g.id)}>{String(g.name)} · {g.hasPin ? 'PIN set' : 'No PIN'}{g.locked ? ' · Locked' : ''}{!g.hasPhone ? ' · No phone' : ''}</option>)}</Select></Field><Field label="Action"><Select name="action"><option value="set">Set / replace PIN</option><option value="revoke">Revoke PIN and sessions</option></Select></Field><Field label="New PIN (leave blank for revoke)"><Input name="pin" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="new-password" /></Field></>}
      {tool === 'consent' && <><Field label="Contact"><Select required value={targetId} onChange={e => setTargetId(e.target.value)}><option value="">Select student or household guardian</option>{options(extra?.contacts, 'partnerId').map(c => <option key={String(c.partnerId)} value={String(c.partnerId)}>{String(c.name)}{c.student ? ' · Student' : ' · Guardian'}</option>)}</Select></Field>{consentContact && <ul className="text-xs muted">{rows(consentContact.channels)?.map((c, i) => <li key={i}>{String(c.channel)} · {String(c.address ?? 'No address')} · service: {String(c.service ?? 'Not recorded')} · marketing: {String(c.marketing ?? 'Not recorded')} · native opt-out: {c.nativeOptOut ? 'Yes' : 'No'}</li>)}</ul>}<Field label="Channel"><Select name="channel"><option value="sms">SMS</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option></Select></Field><Field label="Purpose"><Select name="purpose"><option value="service">Service</option><option value="marketing">Marketing</option></Select></Field><Field label="Consent"><Select name="state"><option value="granted">Granted</option><option value="withdrawn">Withdrawn</option></Select></Field><Field label="Evidence source"><Select name="source">{['in_person', 'paper_form', 'web_form', 'verbal', 'reply_stop'].map(s => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</Select></Field></>}
      {tool === 'waiver' && extra && <><h3 className="font-semibold">{String(extra.title)}</h3><p className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-(--crm-line) p-4 text-sm">{String(extra.text)}</p><p className="text-sm">Recorded state: {String(extra.state)}</p>{extra.state === 'signed' ? <p>Signed by {String(extra.signedBy)} · {when(extra.signedAt)}. A previously signed waiver cannot be signed again through this action.</p> : <><Field label="Person signing"><Select name="signer" required><option value="">Choose authorized signer</option>{options(extra.signers, 'partnerId').map(s => <option key={String(s.partnerId)} value={String(s.partnerId)}>{String(s.name)} · {String(s.relationship)}</option>)}</Select></Field><Field label="Signer’s full name"><Input name="signedBy" maxLength={120} required /></Field><SignaturePad onChange={setSignature} /><label className="flex gap-2 text-sm"><input type="checkbox" name="agreed" required />The selected signer has read and agrees to the waiver above and personally provided this signature.</label></>}</>}
      {tool === 'course' && <><Field label="Course"><Select required value={targetId} onChange={e => void loadTarget(e.target.value)}><option value="">Choose a course</option>{options(extra?.templates).map(t => <option key={String(t.id)} value={String(t.id)}>{String(t.name)} · {t.autoEnroll ? 'Auto-enrollment enabled' : 'Manual booking'}</option>)}</Select></Field>{sheetBusy && <p role="status">Reading course roster…</p>}{sheetMatches && object(sheet?.course) && <p className="text-sm">{options(sheet.course.members).some(m => m.id === memberId) ? 'This student is on this course roster.' : 'This student is not on this course roster.'}</p>}<Field label="Roster action"><Select name="action"><option value="add">Add student</option><option value="remove">Remove student</option></Select></Field><p className="text-xs muted">The review checks automatic booking creation/cancellation and capacity before confirmation.</p></>}
      {['rank', 'archive', 'attendance', 'guardian', 'pin', 'consent', 'course'].includes(tool) && <Field label={tool === 'guardian' ? 'Identity / channel verification reference' : tool === 'consent' ? 'Consent evidence' : 'Reason / staff evidence'}><Textarea name="reason" maxLength={tool === 'guardian' ? 300 : 500} required /></Field>}
      {tool !== 'photo' && <Button type="submit" variant="primary" disabled={!canSubmit || (tool === 'waiver' && (extra?.state === 'signed' || !signature)) || (tool === 'archive' && (!Array.isArray(extra?.blockers) || extra.blockers.length > 0))}>{busy ? 'Checking review…' : 'Review action'}</Button>}
    </fieldset></form>}
  </Modal></div>;
}
