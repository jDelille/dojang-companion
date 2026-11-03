'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { memberRead } from '@/integrations/memberActions';
import { ledgerFrom, type BillingLedger, type LedgerInvoice, type LedgerRefund } from '@/domain/memberCompletion';
import { string, nonnegative } from '@/domain/memberActions';
import { explainHubError } from '@/domain/hubAction';
import { Field, Textarea } from '@/templates/roster/components/ui/form';
import { Button } from '@/templates/roster/components/ui/button';
import MemberActionDialog, { type PreparedMemberAction } from './memberActionDialog';
import '@/templates/roster/roster.css';
const STATE: Record<string, string> = { awaiting_approval: 'Awaiting owner approval', awaiting_refund_payment: 'Credit note posted · awaiting recorded desk refund', awaiting_provider_refund: 'Credit note posted · awaiting provider confirmation', refunded_by_provider: 'Provider-confirmed refund', refunded: 'Staff-recorded refund payment', cancelled: 'Cancelled' };
const money = (amount: number, currency: string) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount); } catch { return `${currency} ${amount}`; } };
export default function MemberSettlement({ memberId, name, onAuthenticationLost }: { memberId: string; name: string; onAuthenticationLost: () => void }) {
  const [data, setData] = useState<BillingLedger | null>(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({}), [prepared, setPrepared] = useState<PreparedMemberAction | null>(null), [busy, setBusy] = useState(false);
  const alive = useRef(true), inFlight = useRef(false); const router = useRouter();
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    void memberRead('billing_ledger', { memberId }, controller.signal).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') { const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); return; }
      const parsed = ledgerFrom(answer.result, memberId); if (!parsed) setError('HUB_RESPONSE_UNREADABLE'); else setData(parsed);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, reload, onAuthenticationLost]);
  function refresh() { setData(null); setError(''); setNotes({}); setReload(n => n + 1); router.refresh(); }
  async function request(invoice: LedgerInvoice) {
    if (busy || inFlight.current || !notes[invoice.id]?.trim()) return;
    inFlight.current = true; setBusy(true); setError('');
    const answer = await memberRead('refund_preview', { memberId, invoiceId: invoice.id });
    inFlight.current = false;
    if (!alive.current) return;
    setBusy(false);
    if (answer.outcome !== 'done') { const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); return; }
    const v = answer.result;
    if (v.invoiceId !== invoice.id || v.amount !== invoice.total || v.currency !== invoice.currency || !string(v.reviewToken) || !/^[a-f0-9]{64}$/.test(v.reviewToken) || !nonnegative(v.version) || !string(v.number) || (v.method !== 'provider' && v.method !== 'manual') || !Array.isArray(v.effects) || !v.effects.every(string)) { setError('HUB_RESPONSE_UNREADABLE'); return; }
    setPrepared({ title: 'Request full invoice refund', command: { operation: 'request_refund', subjectId: memberId, payload: { memberId, invoiceId: invoice.id, reason: notes[invoice.id].trim(), reviewToken: v.reviewToken } },
      evidence: [{ label: 'Student context', value: `${name} · ID ${memberId}` }, { label: 'Invoice', value: `${invoice.number} · ID ${invoice.id}` }, { label: 'Full refund amount', value: money(invoice.total, invoice.currency) }, { label: 'Method', value: v.method === 'provider' ? 'Original online payment provider' : 'Recorded at the desk' }, { label: 'Reason', value: notes[invoice.id].trim() }], effects: [...v.effects as string[], 'Creates a refund request awaiting owner approval. It does not itself post a credit note or return money.', 'This is a whole-invoice refund. A linked household invoice may cover other students.'] });
  }
  function review(invoice: LedgerInvoice, refund: LedgerRefund, operation: 'approve_refund' | 'cancel_refund' | 'record_refund_payment') {
    if (busy || inFlight.current) return;
    const reason = notes[`r${refund.id}`]?.trim(); if (!reason) return;
    const effects = operation === 'approve_refund' ? ['Posts a full credit note in Odoo after owner approval. A credit note alone does not establish that money was returned.', refund.method === 'provider' ? 'Wait for the original provider to confirm the refund; do not record a duplicate desk refund.' : 'Return the money at the desk, then record the actual refund payment in a separate step.'] : operation === 'cancel_refund' ? ['Cancels the pending request. No accounting entry or money return is created.'] : ['Record this only after staff actually returned the money to the customer.', 'Creates and reconciles the native Odoo refund payment against the posted credit note, using the original desk journal where available. The evidence remains staff-recorded, not provider-confirmed.'];
    setPrepared({ title: operation === 'approve_refund' ? 'Approve full refund / post credit note' : operation === 'cancel_refund' ? 'Cancel refund request' : 'Record completed desk refund payment', command: { operation, subjectId: memberId, payload: { refundId: refund.id, expectedVersion: refund.version, reason } }, evidence: [{ label: 'Student context', value: `${name} · ID ${memberId}` }, { label: 'Invoice / refund', value: `${invoice.number} · Refund #${refund.id}` }, { label: 'Whole-invoice amount', value: money(refund.amount, refund.currency) }, { label: 'Reason / evidence', value: reason }], effects });
  }
  if (prepared) return <><MemberActionDialog prepared={prepared} onAuthenticationLost={onAuthenticationLost} onClose={() => { setPrepared(null); refresh(); }} onSaved={() => router.refresh()} /><p className="text-sm text-(--crm-muted)">Settlement review is open. The ledger refreshes when the review closes.</p></>;
  return <section className="roster-scope rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5" aria-label="Settlement and refunds"><header className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Settlement and refunds</h2><Button type="button" disabled={busy} onClick={refresh}>Refresh ledger</Button></header>
    <p className="mt-3 text-[12px] text-(--crm-muted)">Amounts are for whole linked invoices and may include household charges. Staff-recorded payments and provider-confirmed receipts are identified separately.</p>
    {error && <p role="alert" className="mt-4 text-sm">{error === 'FORBIDDEN' ? 'The settlement ledger requires owner or manager access.' : explainHubError(error)}</p>}{!data && !error && <p role="status" className="mt-4 text-sm">Loading Odoo settlement evidence…</p>}
    {data && <>{data.invoices.length === 0 && <p className="mt-4 text-sm">No linked posted customer invoices were returned. This does not establish a zero balance.</p>}{data.invoices.length === 50 && <p className="mt-4 text-xs muted">The read reached its 50-invoice limit; older invoices may be omitted.</p>}
      <div className="mt-4 space-y-5">{data.invoices.map(invoice => <article key={invoice.id} className="space-y-3 rounded-lg border border-(--crm-line) p-4 text-sm"><h3 className="font-semibold">{invoice.number} · {money(invoice.total, invoice.currency)}</h3><p>{invoice.date ?? 'Date not supplied'} · Payment state: {invoice.paymentState.replaceAll('_', ' ')} · Remaining: {money(invoice.remaining, invoice.currency)}</p><p>Settlement evidence: {invoice.settlementEvidence.length ? invoice.settlementEvidence.map(s => s === 'provider_receipt' ? 'Provider-confirmed receipt' : 'Staff-recorded payment').join(', ') : 'No settlement evidence supplied'}</p>
        <ul className="space-y-2">{invoice.payments.map(payment => <li key={payment.id}>{money(payment.amount, invoice.currency)} · {payment.date} · {payment.journal} · {payment.evidence === 'provider_receipt' ? 'Provider-confirmed receipt' : 'Staff-recorded'}{payment.provider ? ` · ${payment.provider}` : ''}{payment.providerReference ? ` · Reference ${payment.providerReference}` : ''}</li>)}</ul>
        {invoice.refunds.map(refund => <section key={refund.id} className="space-y-3 border-t border-(--crm-line) pt-3"><p className="font-semibold">Refund #{refund.id}: {money(refund.amount, refund.currency)} · {STATE[refund.state]}</p><p>Requested by {refund.requestedBy}{refund.approvedBy ? ` · Approved by ${refund.approvedBy}` : ''}{refund.creditNote ? ` · Credit note ${refund.creditNote}` : ''}{refund.refundPayment ? ` · Refund payment ${refund.refundPayment}` : ''}</p>
          {['awaiting_approval', 'awaiting_refund_payment'].includes(refund.state) && <><Field label="Refund reason / completed-payment evidence"><Textarea value={notes[`r${refund.id}`] ?? ''} maxLength={500} onChange={e => setNotes(old => ({ ...old, [`r${refund.id}`]: e.target.value }))} /></Field><div className="flex flex-wrap gap-2">{refund.state === 'awaiting_approval' && <>{data.canApprove && <Button type="button" disabled={!notes[`r${refund.id}`]?.trim()} onClick={() => review(invoice, refund, 'approve_refund')}>Review owner approval</Button>}<Button type="button" disabled={!notes[`r${refund.id}`]?.trim()} onClick={() => review(invoice, refund, 'cancel_refund')}>Review cancellation</Button></>}{refund.state === 'awaiting_refund_payment' && refund.method === 'manual' && <Button type="button" disabled={!notes[`r${refund.id}`]?.trim()} onClick={() => review(invoice, refund, 'record_refund_payment')}>Review recording actual desk refund</Button>}</div></>}
        </section>)}
        {invoice.refundable && <><Field label="Reason for full invoice refund"><Textarea value={notes[invoice.id] ?? ''} maxLength={500} disabled={busy} onChange={e => setNotes(old => ({ ...old, [invoice.id]: e.target.value }))} /></Field><Button type="button" disabled={busy || !notes[invoice.id]?.trim()} onClick={() => void request(invoice)}>Preview full refund request</Button></>}
      </article>)}</div>
    </>}
  </section>;
}
