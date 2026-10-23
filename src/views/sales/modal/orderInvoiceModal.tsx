import { useEffect } from "react";
import { Download, Dumbbell, Mail, Printer, X } from "lucide-react";
import type { Order } from "../../../types/sales";
import { ORDER_STATUS_BADGE, TAX_RATE } from "../../../utils/json/salesData";
import { money, subtotalOf, taxOf, totalOf } from "../../../utils/salesUtils";

/*
   Order Invoice — ported from #modal-invoice in tailwind/src/orders.html and
   openInvoice() in assets/js/orders.js.

   Sits at z-[1050] so it stacks above the order-detail modal that opens it.
*/

type OrderInvoiceModalProps = {
  order: Order | null;
  onClose: () => void;
  onAction: (message: string) => void;
};

const OrderInvoiceModal = ({ order, onClose, onAction }: OrderInvoiceModalProps) => {
  const open = order !== null;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={open ? "modal-overlay open z-[1050]" : "modal-overlay z-[1050]"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">
            Invoice <span className="gt">{order?.id ?? ""}</span>
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="rounded-xl p-4 card-dashed-gold">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gold-grad">
                <Dumbbell className="w-[15px] h-[15px] c-dark shrink-0" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-black gt leading-none">Dreams GYM</div>
                <div className="text-[10px] c-dim mt-0.5">Austin HQ · EIN 47-1234567</div>
              </div>
            </div>
            <span
              className={`badge ${order ? ORDER_STATUS_BADGE[order.status] : "badge-present"}`}
            >
              <span className="dot" />
              {order?.status ?? "—"}
            </span>
          </div>
          <div className="flex justify-between text-[11px] c-dim py-0.5">
            <span>Bill To</span>
            <span className="c-text2 font-semibold">{order?.customer ?? "—"}</span>
          </div>
          <div className="flex justify-between text-[11px] c-dim py-0.5">
            <span>Date</span>
            <span className="c-text2">{order?.date ?? "—"}</span>
          </div>
          <div className="flex justify-between text-[11px] c-dim py-0.5">
            <span>Payment</span>
            <span className="c-text2">{order?.pay ?? "—"}</span>
          </div>
          <div className="border-dashed-gold" />
          <div className="space-y-1.5 mb-2">
            {order?.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex justify-between text-[11px]">
                <span className="c-text2">
                  {item.qty}× {item.name}
                </span>
                <span className="c-text2">{money(item.qty * item.price)}</span>
              </div>
            ))}
          </div>
          <div className="border-dashed-gold" />
          <div className="flex justify-between text-[11px] c-dim py-0.5">
            <span>Subtotal</span>
            <span className="c-text2">{order ? money(subtotalOf(order)) : "$0"}</span>
          </div>
          <div className="flex justify-between text-[11px] c-dim py-0.5">
            <span>Sales Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
            <span className="c-text2">{order ? money(taxOf(order)) : "$0"}</span>
          </div>
          <div className="flex justify-between font-black text-sm mt-1">
            <span className="c-text">Total</span>
            <span className="gt">{order ? money(totalOf(order)) : "$0"}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={() => onAction("Invoice emailed to customer")}
          >
            <Mail className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Email
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={() => onAction("Invoice downloaded (PDF)")}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            PDF
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={() => onAction("Invoice sent to printer")}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;
