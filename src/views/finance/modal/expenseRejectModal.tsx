import { useState } from "react";
import { X } from "lucide-react";
import type { Expense } from "../../../types/expenses";
import { REJECT_REASONS } from "../../../utils/json/expensesData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Reject Expense — ported from #modal-reject in tailwind/src/expenses.html and
   openReject()/confirmReject() in assets/js/expenses.js. The optional note is
   collected but, as in the template, only the reason reaches the record.
*/

const REASON_OPTIONS = REJECT_REASONS.map((value) => ({ value, label: value }));

type ExpenseRejectModalProps = {
  expense: Expense | null;
  onClose: () => void;
  onConfirm: (id: number, reason: string) => void;
};

const ExpenseRejectModal = ({ expense, onClose, onConfirm }: ExpenseRejectModalProps) => {
  const open = expense !== null;
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [note, setNote] = useState("");

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Reject Expense</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm mb-4 c-dim">
          Rejecting{" "}
          <span className="font-semibold c-text">{expense?.title ?? "this expense"}</span>.
          Select a reason:
        </p>
        <div className="mb-3">
          <label className="f-label">Reason</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Reason"
            options={REASON_OPTIONS}
            value={reason}
            onChange={(option) => setReason(option?.value ?? REJECT_REASONS[0])}
          />
        </div>
        <div>
          <label className="f-label">Note (optional)</label>
          <textarea
            className="fp-input py-2.5 text-sm"
            rows={2}
            placeholder="Add a note for the requester…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!expense) return;
              onConfirm(expense.id, reason);
              onClose();
            }}
          >
            Reject Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseRejectModal;
