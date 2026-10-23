import { Check, Printer } from "lucide-react";
import PosModal from "../posModal";
import { money } from "../posUtils";
import { spawnRipple } from "../ripple";

/*
   Payment Successful confirmation, ported from #modal-sale-complete in
   tailwind/src/pos.html.

   The amounts are captured at the moment the sale closed rather than read
   live: the cart is already cleared by the time this shows.
*/

type SaleCompleteModalProps = {
  open: boolean;
  onClose: () => void;
  amount: number;
  method: string;
  invoiceId: string;
};

const SaleCompleteModal = ({
  open,
  onClose,
  amount,
  method,
  invoiceId,
}: SaleCompleteModalProps) => (
  <PosModal open={open} onClose={onClose} boxClassName="text-center" chromeless>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-gold grad-gold">
      <Check className="ic-30 t-ink" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-black c-text mb-1">Payment Successful!</h3>
    <p className="text-sm mb-4 t-muted">
      Transaction completed and receipt generated.
    </p>
    <div className="rounded-xl p-4 mb-4 text-left panel-dark">
      <div className="flex justify-between text-xs mb-2 t-muted">
        <span>Amount Paid</span>
        <span className="font-black gt text-sm">{money(amount)}</span>
      </div>
      <div className="flex justify-between text-xs mb-2 t-muted">
        <span>Method</span>
        <span className="font-semibold t-soft">{method}</span>
      </div>
      <div className="flex justify-between text-xs t-muted">
        <span>Invoice</span>
        <span className="font-semibold t-soft">{invoiceId}</span>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        className="btn-ghost ripple flex-1 py-2.5 text-sm"
        onClick={onClose}
      >
        Close
      </button>
      <button
        type="button"
        className="btn-gold ripple flex-1 py-2.5 text-sm flex items-center justify-center gap-1"
        onClick={(e) => {
          spawnRipple(e);
          window.print();
        }}
      >
        <Printer className="ic-14" aria-hidden="true" />
        Print
      </button>
    </div>
  </PosModal>
);

export default SaleCompleteModal;
