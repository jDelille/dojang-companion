import { CircleCheck, Paperclip, Pencil, X } from "lucide-react";
import type { Expense } from "../../../types/expenses";
import { CAT_META, EXPENSE_STATUS_BADGE } from "../../../utils/json/expensesData";
import { moneyWhole } from "../../../utils/formatUtils";
import { EXPENSE_CAT_ICON } from "../expenseIcons";

/*
   Expense Details — ported from #modal-view in tailwind/src/expenses.html and
   openView() in assets/js/expenses.js. The Approve button is hidden once the
   expense is already Paid.
*/

type ExpenseViewModalProps = {
  expense: Expense | null;
  onClose: () => void;
  onReceipt: () => void;
  onApprove: () => void;
  onEdit: () => void;
};

const ExpenseViewModal = ({
  expense,
  onClose,
  onReceipt,
  onApprove,
  onEdit,
}: ExpenseViewModalProps) => {
  const open = expense !== null;
  const meta = expense ? CAT_META[expense.category] : null;
  const Icon = expense ? EXPENSE_CAT_ICON[expense.category] : null;

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
          <h3 className="text-base font-black c-text">Expense Details</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
          <div className={`exp-ic ${meta?.cls ?? "ic-gold"}`}>
            {Icon && (
              <Icon
                className="w-[18px] h-[18px] shrink-0"
                style={{ color: meta?.color }}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black c-text truncate">
              {expense?.title ?? "Expense"}
            </div>
            <div className="text-[11px] c-gold font-semibold uppercase tracking-wider">
              {expense?.category ?? "Category"}
            </div>
          </div>
          <span
            className={`badge ${expense ? EXPENSE_STATUS_BADGE[expense.status] : "badge-present"}`}
          >
            <span className="dot" />
            {expense?.status ?? "Paid"}
          </span>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Amount</span>
            <span className="v gt">{expense ? moneyWhole(expense.amount) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Date</span>
            <span className="v">{expense?.date ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Method</span>
            <span className="v">{expense?.method ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Receipt</span>
            <span className="v">{expense?.receipt || "None attached"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Notes</span>
            <span className="v">{expense?.notes || "—"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onReceipt}
          >
            <Paperclip className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Receipt
          </button>
          <button
            type="button"
            className={`btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2${expense?.status === "Paid" ? " hidden" : ""}`}
            onClick={onApprove}
          >
            <CircleCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Approve
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseViewModal;
