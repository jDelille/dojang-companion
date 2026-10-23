import { Trash2 } from "lucide-react";
import type { Expense } from "../../../types/expenses";

/*
   Delete Expense — ported from #modal-delete in tailwind/src/expenses.html and
   openDelete()/confirmDelete() in assets/js/expenses.js.
*/

type ExpenseDeleteModalProps = {
  expense: Expense | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ExpenseDeleteModal = ({ expense, onClose, onConfirm }: ExpenseDeleteModalProps) => {
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
      <div className="modal-box glass modal-w-380">
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Delete Expense?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Permanently remove{" "}
          <span className="font-semibold c-text">{expense?.title ?? "this expense"}</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!expense) return;
              onConfirm(expense.id);
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDeleteModal;
