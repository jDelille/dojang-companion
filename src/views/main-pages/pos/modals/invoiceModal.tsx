import {
  Download,
  Dumbbell,
  Mail,
  MessageCircle,
  Printer,
  X,
} from "lucide-react";
import PosModal from "../posModal";
import PosQr from "../posQr";
import { TAX_RATE } from "../posData";
import { cur, initials, money } from "../posUtils";
import { spawnRipple } from "../ripple";
import type { Transaction, TxStatus } from "../types";

/*
   Order Details (Invoice), ported from #modal-invoice / viewInvoice() in
   tailwind/src/pos.html and assets/js/pos.js.

   Opens over Order History (`elevated`, matching the template's z-1050) and
   closes back to it, so a cashier can page through several sales.

   Totals are recomputed from the stored lines rather than read off `amt`,
   which is the rounded figure the history table shows.
*/

const STATUS_BADGE: Record<TxStatus, string> = {
  Paid: "badge-paid",
  Refunded: "badge-expired",
  "Partially Refunded": "badge-pending",
  Pending: "badge-pending",
};

const InvoiceModal = ({
  tx,
  onClose,
  onToast,
}: {
  tx: Transaction | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}) => {
  const sub = tx?.lines.reduce((s, l) => s + l.q * l.p, 0) ?? 0;
  const disc = tx?.disc || 0;
  const tax = (sub - disc) * TAX_RATE;
  const total = sub - disc + tax;
  const barcode = tx
    ? tx.id.replace("#", "").replace("-", " ") + " " + String(1000 + (sub % 9000))
    : "INV 0000";

  return (
    <PosModal
      open={!!tx}
      onClose={onClose}
      elevated
      boxClassName="glass p-0! flex flex-col modal-lg"
      head={
        <div className="flex items-center justify-between p-5 bd-b">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center grad-gold">
              <Dumbbell className="ic-17 t-ink" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-black c-text leading-none">
                Invoice <span className="gt">{tx?.id ?? "#INV-0000"}</span>
              </h3>
              <div className="text-[11px] mt-0.5 t-muted">
                Dreams GYM · Austin HQ
              </div>
            </div>
          </div>
          <button
            type="button"
            className="modal-x"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="ic-15" aria-hidden="true" />
          </button>
        </div>
      }
    >
      <div className="overflow-y-auto p-5 mh-66">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="rounded-xl p-3 panel-soft">
            <div className="text-[9px] font-black uppercase tracking-wider t-dim">
              Date &amp; Time
            </div>
            <div className="text-xs font-semibold c-text mt-1">{tx?.date ?? "—"}</div>
          </div>
          <div className="rounded-xl p-3 panel-soft">
            <div className="text-[9px] font-black uppercase tracking-wider t-dim">
              Cashier
            </div>
            <div className="text-xs font-semibold c-text mt-1">
              {tx?.cashier ?? "—"}
            </div>
          </div>
          <div className="rounded-xl p-3 panel-soft">
            <div className="text-[9px] font-black uppercase tracking-wider t-dim">
              Payment
            </div>
            <div className="text-xs font-semibold c-text mt-1">
              {tx?.method ?? "—"}
            </div>
          </div>
          <div className="rounded-xl p-3 panel-soft">
            <div className="text-[9px] font-black uppercase tracking-wider t-dim">
              Status
            </div>
            <div className="mt-1">
              <span
                className={`${tx ? STATUS_BADGE[tx.status] : "badge-inactive"} text-[10px] font-bold px-2 py-0.5 rounded-full`}
              >
                {tx?.status ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="gold-border-card p-4 mb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 grad-gold">
            {tx ? initials(tx.name) : "AB"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold c-text">{tx?.name ?? "—"}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full chip-gold">
                {tx?.mid ?? "—"}
              </span>
            </div>
            <div className="text-[11px] mt-0.5 t-muted">
              Plan: <span className="t-soft">{tx?.plan ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* overflow-hidden alone clipped these columns on a phone */}
        <div className="rounded-xl overflow-hidden mb-4 bd">
          <div className="overflow-x-auto">
            <table className="w-full data-table min-w-[420px]">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {tx?.lines.map((l, i) => (
                  <tr key={l.n + i}>
                    <td className="text-xs font-semibold c-text">{l.n}</td>
                    <td className="text-xs text-center t-soft">{l.q}</td>
                    <td className="text-xs text-right t-soft">{cur(l.p)}</td>
                    <td className="text-xs text-right font-bold c-text">
                      {cur(l.q * l.p)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 panel-soft">
            <div className="text-[9px] font-black uppercase tracking-wider mb-2 t-dim">
              Notes
            </div>
            <div className="text-xs t-mute2">
              {tx?.notes || "No notes for this transaction."}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <PosQr />
              <div className="flex-1">
                <div className="barcode" />
                <div className="text-center text-[9px] mt-1 tracking-widest t-muted">
                  <span>{barcode}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 totals-box-lg">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs t-muted">
                <span>Subtotal</span>
                <span className="t-soft">{money(sub)}</span>
              </div>
              <div className="flex justify-between text-xs t-muted">
                <span>Discount</span>
                <span className="t-red">-{money(disc)}</span>
              </div>
              <div className="flex justify-between text-xs t-muted">
                <span>Sales Tax (8.25%)</span>
                <span className="t-soft">{money(tax)}</span>
              </div>
              <div className="flex justify-between font-black text-base bd-t pt-2 mt-1.5">
                <span className="c-text">Grand Total</span>
                <span className="gt">{money(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-4 bd-t">
        <button
          type="button"
          className="btn-gold ripple flex items-center gap-1.5 px-3.5 py-2 text-xs"
          onClick={(e) => {
            spawnRipple(e);
            window.print();
          }}
        >
          <Printer className="ic-13" aria-hidden="true" />
          Print
        </button>
        <button
          type="button"
          className="btn-ghost ripple flex items-center gap-1.5 px-3.5 py-2 text-xs"
          onClick={(e) => {
            spawnRipple(e);
            onToast("Invoice downloaded (PDF)");
          }}
        >
          <Download className="ic-13" aria-hidden="true" />
          Download PDF
        </button>
        <button
          type="button"
          className="btn-ghost ripple flex items-center gap-1.5 px-3.5 py-2 text-xs"
          onClick={(e) => {
            spawnRipple(e);
            onToast("Receipt emailed");
          }}
        >
          <Mail className="ic-13" aria-hidden="true" />
          Email
        </button>
        <button
          type="button"
          className="btn-ghost ripple flex items-center gap-1.5 px-3.5 py-2 text-xs"
          onClick={(e) => {
            spawnRipple(e);
            onToast("Sent via WhatsApp");
          }}
        >
          <MessageCircle className="ic-13" aria-hidden="true" />
          WhatsApp
        </button>
        <div className="flex-1" />
        <button
          type="button"
          className="btn-ghost ripple px-4 py-2 text-xs"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </PosModal>
  );
};

export default InvoiceModal;
