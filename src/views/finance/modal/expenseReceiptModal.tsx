import { UploadCloud, X } from "lucide-react";
import type { Expense } from "../../../types/expenses";
import { moneyWhole } from "../../../utils/formatUtils";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Attach Receipt — ported from #modal-receipt in tailwind/src/expenses.html and
   openReceipt()/confirmReceipt() in assets/js/expenses.js.

   The dropzone is presentational in the template too: confirming always stores
   a synthetic "receipt-<id>.pdf" filename rather than reading the file input.
*/

type ExpenseReceiptModalProps = {
  expense: Expense | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ExpenseReceiptModal = ({ expense, onClose, onConfirm }: ExpenseReceiptModalProps) => {
  const open = expense !== null;

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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Attach Receipt</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-2">
          {expense ? `${expense.title} · ${moneyWhole(expense.amount)}` : "Expense"}
        </div>
        <p className="text-xs c-dim mb-3">
          {expense?.receipt ? "Current: " + expense.receipt : "No receipt attached yet"}
        </p>
        <label className="dropzone block mb-4">
          <UploadCloud aria-hidden="true" />
          <div className="text-sm font-semibold c-text">
            Drop a receipt here or click to browse
          </div>
          <div className="text-xs mt-1 c-dim">PDF, JPG or PNG · up to 5 MB</div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
        </label>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!expense) return;
              onConfirm(expense.id);
              onClose();
            }}
          >
            Attach Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReceiptModal;
