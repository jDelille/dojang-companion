import { useState } from "react";
import { CircleCheck } from "lucide-react";
import PosModal from "../posModal";
import { money } from "../posUtils";
import type { PayMethod, Totals } from "../types";

/*
   Complete Payment, ported from #modal-payment, completeSale(), setTender()
   and confirmPayment() in tailwind/src/pos.html and assets/js/pos.js.

   Cash must actually cover the bill. The template originally never checked
   this, so a sale could be completed with nothing tendered.
*/

/** Float tolerance: a half-cent short is not short. */
const EPSILON = 0.005;

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  totals: Totals;
  payMethod: PayMethod;
  payLabel: string;
  onConfirm: (tendered: number | null) => void;
  onError: (msg: string) => void;
};

const PaymentModal = ({
  open,
  onClose,
  totals,
  payMethod,
  payLabel,
  onConfirm,
  onError,
}: PaymentModalProps) => {
  const [tender, setTender] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  const fail = (msg: string) => {
    setInvalid(true);
    onError(msg);
  };

  const submit = () => {
    if (payMethod !== "Cash") {
      onConfirm(null);
      return;
    }
    const raw = tender.trim();
    const value = raw === "" ? NaN : parseFloat(raw);
    if (isNaN(value)) {
      fail("Enter the amount tendered");
      return;
    }
    if (value < totals.total - EPSILON) {
      fail("Short by " + money(totals.total - value));
      return;
    }
    onConfirm(value);
  };

  const quickTender = (kind: "exact" | "50" | "100") => {
    setTender(kind === "exact" ? totals.total.toFixed(2) : kind);
    setActiveKey(kind);
    setInvalid(false);
  };

  return (
    <PosModal open={open} onClose={onClose} title="Complete Payment">
      <div className="pay-summary">
        <div className="text-[10px] font-black uppercase tracking-wider t-dim">
          Amount Due
        </div>
        <div className="pay-amount gt mt-1">{money(totals.total)}</div>
        <div className="text-[11px] t-muted mt-1">
          Method · <span className="t-gold font-semibold">{payLabel}</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Amount Tendered</label>
        <input
          type="number"
          className={invalid ? "fp-input py-2.5 text-sm invalid" : "fp-input py-2.5 text-sm"}
          placeholder={totals.total.toFixed(2)}
          value={tender}
          onChange={(e) => {
            setTender(e.target.value);
            setActiveKey(null);
            setInvalid(false);
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {(["exact", "50", "100"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            className={activeKey === kind ? "tender-key active" : "tender-key"}
            onClick={() => quickTender(kind)}
          >
            {kind === "exact" ? "Exact" : "$" + kind}
          </button>
        ))}
      </div>
      <div className="modal-actions">
        <button
          type="button"
          className="btn-ghost ripple flex-1 py-2.5 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold ripple flex-1 py-2.5 text-sm flex items-center justify-center gap-1"
          onClick={submit}
        >
          <CircleCheck className="ic-14" aria-hidden="true" />
          Confirm &amp; Pay
        </button>
      </div>
    </PosModal>
  );
};

export default PaymentModal;
