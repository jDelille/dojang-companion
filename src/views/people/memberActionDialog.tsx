'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { newRequestKey, explainHubError } from '@/domain/hubAction';
import { memberWrite } from '@/integrations/memberActions';
import { memberPayloadAllowed, type MemberCommand, object } from '@/domain/memberActions';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import { Modal } from '@/templates/roster/components/ui/overlay';
import { Button } from '@/templates/roster/components/ui/button';
import Image from 'next/image';

export type PreparedMemberAction = { command: MemberCommand; title: string; effects: string[]; evidence: { label: string; value: string }[] };
export default function MemberActionDialog({ prepared, onClose, onSaved, onAuthenticationLost }: { prepared: PreparedMemberAction; onClose: () => void; onSaved: (result: Record<string, unknown>) => void; onAuthenticationLost?: () => void }) {
  const [status, setStatus] = useState<'review' | 'pending' | 'uncertain' | 'failed' | 'saved'>('review');
  const [error, setError] = useState(''), [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const frozen = useRef<{ command: MemberCommand; key: string } | null>(null), inFlight = useRef(false), mounted = useRef(true);
  const errorPanel = useRef<HTMLDivElement | null>(null);
  const reset = useStaffSessionReset(), signedOut = useMarkSignedOut();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (error) errorPanel.current?.focus(); }, [error]);
  const locked = status === 'pending' || status === 'uncertain';
  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (inFlight.current || (status !== 'review' && status !== 'uncertain')) return;
    if (!memberPayloadAllowed(prepared.command.operation, prepared.command.payload)) { setError('INVALID_COMMAND'); setStatus('failed'); return; }
    frozen.current ??= { command: prepared.command, key: newRequestKey() };
    inFlight.current = true; setStatus('pending'); setError('');
    const answer = await memberWrite(frozen.current.command, frozen.current.key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === 'notConfirmed') { setStatus('uncertain'); return; }
    frozen.current = null;
    if (answer.outcome === 'failed') {
      if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(answer.code)) { reset(); signedOut(); if (onAuthenticationLost) onAuthenticationLost(); else window.location.assign('/people'); return; }
      setError(answer.code); setStatus('failed'); return;
    }
    setReceipt(answer.result); setStatus('saved'); onSaved(answer.result);
  }
  const ids = receipt ? Object.entries(receipt).filter(([k, v]) => /Id$/.test(k) && typeof v === 'string') : [];
  return <div className="roster-scope"><Modal open onClose={() => { if (!locked && !inFlight.current) onClose(); }} title={prepared.title} width="lg" footer={<>
    <Button type="button" variant="ghost" disabled={locked} onClick={onClose}>{receipt ? 'Done' : status === 'failed' ? 'Reload and review again' : 'Back'}</Button>
    {!receipt && status !== 'failed' && <Button type="button" variant="primary" disabled={status === 'pending'} onClick={() => void save()}>{status === 'pending' ? 'Waiting for Odoo…' : status === 'uncertain' ? 'Retry same action' : 'Confirm action'}</Button>}
  </>}>
    {error && <div ref={errorPanel} tabIndex={-1} role="alert" className="mb-4 text-sm"><p className="font-semibold">Action was not confirmed</p><p>{explainHubError(error)}</p><p>Error code: {error}</p></div>}
    {receipt ? <section role="status" className="space-y-3 text-sm"><h2 className="font-semibold">Confirmed by Odoo{receipt.replayed === true ? ' · Original request confirmed' : ''}</h2><p>{String(receipt.state ?? (receipt.checkedOutAt ? 'Checked out' : 'Saved')).replaceAll('_', ' ')}</p><dl>{ids.map(([k, v]) => <div key={k} className="flex gap-3"><dt>{k.replace(/([A-Z])/g, ' $1')}</dt><dd>{String(v)}</dd></div>)}</dl>
      {prepared.command.operation === 'payment_link' && typeof receipt.checkoutUrl === 'string' && <><a href={receipt.checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-block underline">Open secure Odoo invoice checkout</a><p>Creating a checkout link does not charge a payment or mark the invoice paid. Refresh billing after completing checkout.</p></>}
      {object(receipt.creditHold) && <p>Credit hold: {String(receipt.creditHold.before ?? 'No hold reported')} → {String(receipt.creditHold.after ?? 'No hold reported')}</p>}
      {typeof receipt.bookingsCreated === 'number' && <p>Bookings created: {receipt.bookingsCreated} · Bookings cancelled: {String(receipt.bookingsCancelled)}</p>}
      {typeof receipt.moneyReturned === 'boolean' && <p>{receipt.moneyReturned ? 'Odoo recorded the staff-attested refund payment. This is staff-recorded evidence.' : 'This action did not confirm that money was returned.'}</p>}
      {typeof receipt.refundId === 'string' && prepared.command.subjectId && receipt.memberId !== prepared.command.subjectId && <p>This whole-invoice refund is recorded under student #{String(receipt.memberId)}. The current student profile provided the linked-invoice context.</p>}
      {receipt.creditNotePosted === true && <p>A credit note was posted in Odoo. A credit note is separate from the return of money.</p>}
      {typeof receipt.next === 'string' && <p>Next state: {receipt.next.replaceAll('_', ' ')}</p>}
      {Array.isArray(receipt.promotions) && <ul>{receipt.promotions.filter(object).map((p, i) => <li key={i}>Student #{String(p.memberId)} · {String(p.rank)} · Award #{String(p.rankHistoryId)}</li>)}</ul>}
      {Array.isArray(receipt.changes) && <ul>{receipt.changes.filter(object).map((c, i) => <li key={i}>Registration #{String(c.registrationId)}: {String(c.before)} → {String(c.after)}</li>)}</ul>}
      {typeof receipt.before === 'string' && 'after' in receipt && !('creditHold' in receipt) && <p>{receipt.before} → {String(receipt.after ?? 'No current rank returned')}</p>}
    </section> : <section className="space-y-4 text-sm">{prepared.command.operation === 'update_member_photo' && typeof prepared.command.payload.image === 'string' && <Image src={`data:image/jpeg;base64,${prepared.command.payload.image}`} alt="New student photo being reviewed" width={160} height={160} unoptimized className="rounded-lg object-contain" />}<dl className="space-y-2">{prepared.evidence.map((e, i) => <div key={i}><dt className="muted">{e.label}</dt><dd className="whitespace-pre-wrap break-words">{e.value}</dd></div>)}</dl><ul className="list-disc space-y-2 pl-5">{prepared.effects.map((e, i) => <li key={i}>{e}</li>)}</ul><p className="muted">Odoo rechecks your staff permissions, site, record scope and command preconditions before committing.</p></section>}
    {status === 'uncertain' && <p role="status" className="mt-4 text-sm">The action may have reached Odoo. Retry preserves the original payload and request key. Do not submit it as a new action.</p>}
  </Modal></div>;
}
