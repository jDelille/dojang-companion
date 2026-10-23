import { useEffect } from "react";
import { FileText, X } from "lucide-react";
import type { Order } from "../../../types/sales";
import { ORDER_STATUS_BADGE, TAX_RATE } from "../../../utils/json/salesData";
import {
  avatarFor,
  initials,
  itemCount,
  money,
  subtotalOf,
  taxOf,
  totalOf,
} from "../../../utils/salesUtils";

/*
   Order Details — ported from #modal-order in tailwind/src/orders.html and
   openOrder() in assets/js/orders.js.

   Built on raw markup rather than components/common/Modal because the header
   carries a second line (the order date) under the title.
*/

type OrderDetailModalProps = {
  order: Order | null;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
};

const OrderDetailModal = ({ order, onClose, onViewInvoice }: OrderDetailModalProps) => {
  const open = order !== null;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-520">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-black c-text">{order?.id ?? "Order"}</h3>
            <div className="text-[11px] c-dim mt-0.5">{order?.date ?? "—"}</div>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="gold-border-card p-4 mb-4 flex items-center gap-3">
          <div
            className={`ord-avatar ${order ? avatarFor(order.id) : "av-gold"} w-12! h-12! text-sm! rounded-xl`}
          >
            {order ? initials(order.customer) : "--"}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold c-text">{order?.customer ?? "—"}</div>
            <div className="text-[11px] c-dim">
              {order ? `${order.pay} · ${itemCount(order)} item(s)` : "—"}
            </div>
          </div>
          <span className={`badge ${order ? ORDER_STATUS_BADGE[order.status] : "badge-present"}`}>
            <span className="dot" />
            {order?.status ?? "—"}
          </span>
        </div>

        <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">Items</div>
        <div className="space-y-2 mb-4">
          {order?.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between text-sm">
              <div className="c-text2">
                {item.name} <span className="c-dim">×{item.qty}</span>
              </div>
              <div className="font-semibold c-text">{money(item.qty * item.price)}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-3 bd-t">
          <div className="flex justify-between text-sm">
            <span className="c-dim">Subtotal</span>
            <span className="c-text2 font-semibold">{order ? money(subtotalOf(order)) : "$0"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="c-dim">Sales Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
            <span className="c-text2 font-semibold">{order ? money(taxOf(order)) : "$0"}</span>
          </div>
          <div className="flex justify-between text-base pt-2 bd-t">
            <span className="font-bold c-text">Total</span>
            <span className="font-black gt">{order ? money(totalOf(order)) : "$0"}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => order && onViewInvoice(order)}
          >
            <FileText className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            View Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
