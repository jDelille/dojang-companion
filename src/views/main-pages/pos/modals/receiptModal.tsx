import { Download, Dumbbell, Printer, Receipt, X } from "lucide-react";
import PosModal from "../posModal";
import PosQr from "../posQr";
import { CASHIER } from "../posData";
import { cur, money } from "../posUtils";
import { spawnRipple } from "../ripple";
import type { CartItem, Totals } from "../types";

/*
   Receipt Preview, ported from #modal-receipt in tailwind/src/pos.html.

   A live preview of the current order — the template kept this in sync from
   updateTotals(); here it simply renders the cart it is given.
*/

type ReceiptModalProps = {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  totals: Totals;
  invoiceId: string;
  memberName: string;
  payMethod: string;
  onDownload: () => void;
};

const ReceiptModal = ({
  open,
  onClose,
  cart,
  totals,
  invoiceId,
  memberName,
  payMethod,
  onDownload,
}: ReceiptModalProps) => (
  <PosModal
    open={open}
    onClose={onClose}
    boxClassName="glass modal-receipt"
    head={
      <div className="modal-head">
        <div className="flex items-center gap-2.5">
          <div className="icon-box w-9! h-9! grad-gold">
            <Receipt className="ic-17 t-ink" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-black c-text leading-none">
              Receipt Preview
            </h3>
            <div className="text-[11px] mt-0.5 t-muted">
              Live preview of the current order
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
    <div className="receipt-scroll">
      <div className="rounded-xl p-4 receipt-paper">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center grad-gold">
            <Dumbbell className="ic-14 t-ink" aria-hidden="true" />
          </div>
          <div className="text-sm font-black gt">Dreams GYM</div>
        </div>
        <div className="text-center text-[10px] t-muted">
          Austin HQ · EIN 47-1234567
        </div>
        <hr className="receipt-dash" />
        <div className="flex justify-between text-[11px] t-muted">
          <span>Invoice</span>
          <span className="t-soft">{invoiceId}</span>
        </div>
        <div className="flex justify-between text-[11px] t-muted">
          <span>Cashier</span>
          <span className="t-soft">{CASHIER}</span>
        </div>
        <div className="flex justify-between text-[11px] t-muted">
          <span>Member</span>
          <span className="t-soft">{memberName}</span>
        </div>
        <div className="flex justify-between text-[11px] t-muted">
          <span>Payment</span>
          <span className="t-soft">{payMethod}</span>
        </div>
        <hr className="receipt-dash" />
        <div className="space-y-1">
          {cart.length ? (
            cart.map((i) => (
              <div key={i.id} className="flex justify-between text-[11px]">
                <span className="truncate mr-2 t-soft">
                  {i.qty}× {i.name}
                </span>
                <span className="t-soft">{cur(i.price * i.qty)}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-[11px] py-2 t-dim3">No items yet</div>
          )}
        </div>
        <hr className="receipt-dash" />
        <div className="flex justify-between text-[11px] t-muted">
          <span>Subtotal</span>
          <span className="t-soft">{money(totals.sub)}</span>
        </div>
        <div className="flex justify-between text-[11px] t-muted">
          <span>Discount</span>
          <span className="t-red">-{money(totals.disc)}</span>
        </div>
        <div className="flex justify-between text-[11px] t-muted">
          <span>Sales Tax (8.25%)</span>
          <span className="t-soft">{money(totals.tax)}</span>
        </div>
        <div className="flex justify-between font-black text-sm mt-1">
          <span className="c-text">Total</span>
          <span className="gt">{money(totals.total)}</span>
        </div>
        <hr className="receipt-dash" />
        <div className="flex items-center justify-between mt-2">
          <PosQr />
          <div className="flex-1 ml-3">
            <div className="barcode" />
            <div className="text-center text-[9px] mt-1 tracking-widest t-muted">
              INV 2048 8842
            </div>
          </div>
        </div>
        <div className="text-center text-[10px] mt-2 t-muted">
          Thank you for training with us! 💪
        </div>
      </div>
    </div>
    <div className="flex gap-2 mt-4">
      <button
        type="button"
        className="btn-ghost ripple flex-1 py-2.5 text-xs"
        onClick={onClose}
      >
        Close
      </button>
      <button
        type="button"
        className="btn-ghost ripple flex-1 py-2.5 text-xs flex items-center justify-center gap-1"
        onClick={(e) => {
          spawnRipple(e);
          onDownload();
        }}
      >
        <Download className="ic-13" aria-hidden="true" />
        Download
      </button>
      <button
        type="button"
        className="btn-gold ripple flex-1 py-2.5 text-xs flex items-center justify-center gap-1"
        onClick={(e) => {
          spawnRipple(e);
          window.print();
        }}
      >
        <Printer className="ic-13" aria-hidden="true" />
        Print
      </button>
    </div>
  </PosModal>
);

export default ReceiptModal;
