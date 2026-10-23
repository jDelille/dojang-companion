import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Expense, ExpenseCategory, ExpenseFormValues } from "../../../types/expenses";
import {
  EXPENSE_CATS,
  EXPENSE_METHODS,
  TODAY_DATE,
} from "../../../utils/json/expensesData";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import { parseDate } from "../useExpenses";

/*
   Add / Edit Expense — ported from #modal-expense-form in
   tailwind/src/expenses.html and openForm()/submitForm() in assets/js/expenses.js.

   The flatpickr date input (d M, Y) becomes CommonDatePicker, seeded from the
   expense being edited or the 14 Jul 2026 default.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type ExpenseFormModalProps = {
  open: boolean;
  target: Expense | null;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues, editId: number | null) => boolean;
};

const ExpenseFormModal = ({ open, target, onClose, onSubmit }: ExpenseFormModalProps) => {
  const [title, setTitle] = useState(target?.title ?? "");
  const [category, setCategory] = useState<ExpenseCategory>(
    target?.category ?? EXPENSE_CATS[0],
  );
  const [amount, setAmount] = useState(target ? String(target.amount) : "");
  const [date, setDate] = useState<Date | null>(parseDate(target?.date, TODAY_DATE));
  const [method, setMethod] = useState(target?.method ?? EXPENSE_METHODS[0]);
  const [notes, setNotes] = useState(target?.notes ?? "");

  const submit = () => {
    const accepted = onSubmit(
      { title, category, amount: Number(amount) || 0, date, method, notes },
      target?.id ?? null,
    );
    if (accepted) onClose();
  };

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
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black c-text">
            {target ? "Edit Expense" : "Add Expense"}
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label">Description</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Electricity Bill"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Category</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Category"
                options={toOptions(EXPENSE_CATS)}
                value={category}
                onChange={(option) =>
                  setCategory((option?.value as ExpenseCategory) ?? EXPENSE_CATS[0])
                }
              />
            </div>
            <div>
              <label className="f-label">Amount ($)</label>
              <input
                type="number"
                min="1"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Date</label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                ariaLabel="Date"
                dateFormat="d M, yy"
                value={date}
                onChange={(e) => setDate((e.value as Date | null) ?? null)}
              />
            </div>
            <div>
              <label className="f-label">Method</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Method"
                options={toOptions(EXPENSE_METHODS)}
                value={method}
                onChange={(option) => setMethod(option?.value ?? EXPENSE_METHODS[0])}
              />
            </div>
          </div>
          <div>
            <label className="f-label">Notes</label>
            <textarea
              className="fp-input py-2.5 text-sm"
              rows={2}
              placeholder="Optional notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
