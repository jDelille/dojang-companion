import { useEffect, useState } from "react";
import { CheckCircle, DollarSign, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { DayPass } from "../../../types/dayPasses";
import { PAYMENT_OPTIONS } from "../../../utils/json/dayPassesData";
import { initials } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";

/*
   Record Payment — ported from #modal-payment in
   tailwind/src/day-passes.html and openPayment()/confirmPayment() in
   assets/js/day-passes.js.

   Recording a payment only toasts; the pass record is unchanged, as in the
   template. Seeded on mount, so the page keys this by pass id.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type PassPaymentModalProps = {
  pass: DayPass | null;
  onClose: () => void;
  onConfirm: (amount: number, method: string) => void;
};

const PassPaymentModal = ({ pass, onClose, onConfirm }: PassPaymentModalProps) => {
  const open = pass !== null;
  const [amount, setAmount] = useState(String(pass?.fee ?? 0));
  const [method, setMethod] = useState(PAYMENT_OPTIONS[0]);

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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box ic-green ic-38">
              <DollarSign className="w-[17px] h-[17px] c-green shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Record Payment</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
          <div className={`dp-avatar av ${pass ? leadAvatar(pass.id) : "av-gold"}`}>
            {pass ? initials(pass.name) : "--"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold c-text">{pass?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">{pass?.type ?? "—"}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="f-label">Amount ($)</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Method</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Payment method"
              options={toOptions(PAYMENT_OPTIONS)}
              value={method}
              onChange={(option) => setMethod(option?.value ?? PAYMENT_OPTIONS[0])}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => onConfirm(Number(amount) || 0, method)}
          >
            <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Collect Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassPaymentModal;
