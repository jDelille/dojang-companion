import { CircleCheck } from "lucide-react";
import type { Expense } from "../../../types/expenses";
import { moneyWhole } from "../../../utils/formatUtils";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Approve Expense — ported from #modal-approve in tailwind/src/expenses.html and
   openApprove()/confirmApprove() in assets/js/expenses.js.
*/

type ExpenseApproveModalProps = {
  expense: Expense | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ExpenseApproveModal = ({ expense, onClose, onConfirm }: ExpenseApproveModalProps) => {
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
        <div className="confirm-ic ok">
          <CircleCheck className="w-6 h-6 c-green shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Approve Expense?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Approve{" "}
          <span className="font-semibold c-text">{expense?.title ?? "this expense"}</span> for{" "}
          <span className="font-semibold c-gold">
            {expense ? moneyWhole(expense.amount) : "$0"}
          </span>{" "}
          and mark it as paid?
        </p>
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
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseApproveModal;
