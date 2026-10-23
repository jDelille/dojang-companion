/* Expenses types — ported from tailwind/src/assets/js/expenses.js */

export type ExpenseCategory =
  | "Rent"
  | "Utilities"
  | "Salaries"
  | "Equipment"
  | "Marketing"
  | "Maintenance"
  | "Supplies";

export type ExpenseStatus = "Paid" | "Pending" | "Rejected";

export type Expense = {
  id: number;
  title: string;
  category: ExpenseCategory;
  amount: number;
  /** Display string, e.g. "Jul 01, 2026". */
  date: string;
  method: string;
  status: ExpenseStatus;
  notes: string;
  /** Attached receipt filename, or null when none. */
  receipt: string | null;
};

/** Fields the Add / Edit Expense modal collects. */
export type ExpenseFormValues = {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: Date | null;
  method: string;
  notes: string;
};
