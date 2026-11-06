'use client';

import type { Member } from '@/domain/member';
import type { MemberInvoice, MemberSubscription, SectionRead } from '@/domain/memberRecords';
import MemberDialog from './memberDialog';

/*
   Payment (payment.png): the billing summary for this student's household.
   Everything comes from the member read Odoo already returned:
   - Current membership: plan, state and next invoice date (Odoo sends no amount)
   - Open invoices: unpaid total; "Pay" opens the existing invoice checkout step
   - Payment method and membership contract: Odoo doesn't send these yet
*/

// "in_progress" → "In progress"
function stateLabel(state: string): string {
  const words = state.replaceAll('_', ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// "2025-09-17" → "Sep 17"
function shortDate(day: string): string {
  const date = new Date(`${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat([], { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

// The subscription to show: a running one first, otherwise the first returned
function currentSubscription(rows: MemberSubscription[]): MemberSubscription | undefined {
  const running = ['in_progress', 'active', 'open', '3_progress'];
  return rows.find(row => running.includes(row.state)) ?? rows[0];
}

function unavailableText(read: SectionRead<unknown> | undefined, what: string): string {
  if (read?.outcome === 'unavailable' && read.reason === 'restricted') return `${what} are restricted by your role.`;
  return `${what} aren't available from Odoo right now.`;
}

export default function MemberPaymentDialog({ member, hubMode, onClose, onPay }: {
  member: Member;
  hubMode: boolean;
  onClose: () => void;
  onPay: () => void;
}) {
  const subscriptions = member.records?.subscriptions;
  const invoices = member.records?.invoices;

  const subscription = subscriptions?.outcome === 'loaded' ? currentSubscription(subscriptions.rows) : undefined;

  const unpaid: MemberInvoice[] = invoices?.outcome === 'loaded'
    ? invoices.rows.filter(invoice => invoice.kind === 'out_invoice' && invoice.remaining > 0)
    : [];
  const unpaidCurrency = unpaid[0]?.currency;
  const sameCurrency = unpaid.every(invoice => invoice.currency === unpaidCurrency);
  const unpaidTotal = unpaid.reduce((sum, invoice) => sum + invoice.remaining, 0);

  let invoiceText: string;
  if (invoices?.outcome !== 'loaded') invoiceText = unavailableText(invoices, 'Invoices');
  else if (unpaid.length === 0) invoiceText = 'Nothing unpaid';
  else if (sameCurrency && unpaidCurrency) invoiceText = `${unpaid.length} unpaid · ${money(unpaidTotal, unpaidCurrency)}`;
  else invoiceText = `${unpaid.length} unpaid`;

  return (
    <MemberDialog
      eyebrow="Billing"
      title={member.householdName || member.name}
      description="Odoo remains the source of truth for contracts and payments."
      onClose={onClose}
    >
      <section className="app-dialog-card" aria-label="Current membership">
        <p className="app-dialog-card-label">Current membership</p>
        {subscription ? (
          <>
            <p className="app-dialog-card-title">{subscription.plan} · {stateLabel(subscription.state)}</p>
            <p className="app-dialog-card-detail">
              {subscription.nextInvoiceDate ? `Next invoice ${shortDate(subscription.nextInvoiceDate)}` : 'No next invoice date'}
            </p>
          </>
        ) : (
          <p className="app-dialog-card-detail">
            {subscriptions?.outcome === 'loaded' ? 'No membership plan is linked in Odoo.' : unavailableText(subscriptions, 'Membership plans')}
          </p>
        )}
      </section>

      <div className="app-dialog-rows">
        <div className="app-dialog-row">
          <div className="min-w-0">
            <p className="app-dialog-option-title">Open invoices</p>
            <p className="app-dialog-option-detail">{invoiceText}</p>
          </div>
          {hubMode && unpaid.length > 0 && (
            <button type="button" className="app-dialog-row-action" onClick={onPay}>Pay</button>
          )}
        </div>
        <div className="app-dialog-row">
          <div className="min-w-0">
            <p className="app-dialog-option-title">Payment method</p>
            <p className="app-dialog-option-detail">Not connected yet</p>
          </div>
        </div>
        <div className="app-dialog-row">
          <div className="min-w-0">
            <p className="app-dialog-option-title">Membership contract</p>
            <p className="app-dialog-option-detail">Not connected yet</p>
          </div>
        </div>
      </div>
    </MemberDialog>
  );
}
