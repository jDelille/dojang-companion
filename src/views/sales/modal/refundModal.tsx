import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Txn } from "../../../types/sales";
import { money } from "../../../utils/salesUtils";

/*
   Refund confirm — ported from #modal-refund in tailwind/src/payments.html
   and openRefund()/doRefund() in assets/js/payments.js.

   Raw markup rather than components/common/Modal: this dialog has no header
   row, leading instead with a centred icon and heading.
*/

const REASON_OPTIONS = [
  "Customer request",
  "Duplicate charge",
  "Service not delivered",
  "Schedule conflict",
  "Other",
].map((reason) => ({ value: reason, label: reason }));

type RefundModalProps = {
  txn: Txn | null;
  onClose: () => void;
  onConfirm: (txn: Txn, reason: string) => void;
};

const RefundModal = ({ txn, onClose, onConfirm }: RefundModalProps) => {
  const open = txn !== null;
  const [reason, setReason] = useState(REASON_OPTIONS[0].value);

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
      <div className="modal-box">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 badge-red-custom">
            <RotateCcw className="w-[24px] h-[24px] c-red shrink-0" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black c-text mb-1">Refund Transaction?</h3>
          <p className="text-sm c-dim mb-4">
            Refund <span className="c-gold font-bold">{txn ? money(txn.amount) : "$0"}</span> for{" "}
            <span className="c-text2 font-semibold">{txn?.customer ?? "—"}</span> (
            <span className="font-mono">{txn?.id ?? "—"}</span>). This cannot be undone.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-1.5 c-text2">Reason (optional)</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Refund reason"
            options={REASON_OPTIONS}
            value={reason}
            onChange={(option) => setReason(option?.value ?? REASON_OPTIONS[0].value)}
          />
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={() => txn && onConfirm(txn, reason)}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Confirm Refund
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
