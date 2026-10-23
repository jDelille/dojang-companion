import { useState } from "react";
import { X } from "lucide-react";
import type { Trainer } from "../../../types/trainers";
import { PAYMENT_METHODS } from "../../../utils/json/trainersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import { fullName } from "../useTrainers";

/*
   Record Payment — ported from #modal-payment in tailwind/src/trainers.html and
   openPayment()/confirmPayment() in assets/js/trainers.js. The amount seeds from
   the trainer's current commission.
*/

const METHOD_OPTIONS = PAYMENT_METHODS.map((value) => ({ value, label: value }));

type TrainerPaymentModalProps = {
  trainer: Trainer | null;
  onClose: () => void;
  onConfirm: (id: number, amount: number, method: string) => void;
};

const TrainerPaymentModal = ({ trainer, onClose, onConfirm }: TrainerPaymentModalProps) => {
  const open = trainer !== null;
  const [amount, setAmount] = useState(trainer ? String(trainer.commission) : "");
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black c-text text-lg">Record Payment</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {trainer ? fullName(trainer) + " · " + trainer.spec : "Trainer"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Amount ($)</label>
            <input
              type="number"
              className="fp-input"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Method</label>
            <CommonSelect
              ariaLabel="Method"
              options={METHOD_OPTIONS}
              value={method}
              onChange={(option) => setMethod(option?.value ?? PAYMENT_METHODS[0])}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!trainer) return;
              onConfirm(trainer.id, Number(amount) || 0, method);
              onClose();
            }}
          >
            Mark Paid
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerPaymentModal;
