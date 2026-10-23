import type { Expense, ExpenseCategory, ExpenseStatus } from "../../types/expenses";

/*
   Expenses seed data — ported verbatim from tailwind/src/assets/js/expenses.js
   (EXPENSES, CAT_META, METHODS, METHOD_ICON, STATUS, TREND). Ids follow the
   X() 1-based sequence; notes default to "" and receipt to null.
*/

export const CAT_META: Record<ExpenseCategory, { color: string; cls: string }> = {
  Rent: { color: "#D4AF37", cls: "ic-gold" },
  Utilities: { color: "#22D3EE", cls: "ic-cyan" },
  Salaries: { color: "#818CF8", cls: "ic-purple" },
  Equipment: { color: "#4ADE80", cls: "ic-green" },
  Marketing: { color: "#FB923C", cls: "ic-orange" },
  Maintenance: { color: "#F87171", cls: "ic-red" },
  Supplies: { color: "#F4D03F", cls: "ic-gold" },
};

export const EXPENSE_CATS = Object.keys(CAT_META) as ExpenseCategory[];

export const EXPENSE_METHODS = ["Bank Transfer", "Cash", "Card", "Apple Pay", "Check"];

export const EXPENSE_STATUS_BADGE: Record<ExpenseStatus, string> = {
  Paid: "badge-present",
  Pending: "badge-late",
  Rejected: "badge-absent",
};

export const REJECT_REASONS = [
  "Missing receipt",
  "Over budget",
  "Duplicate entry",
  "Not authorised",
  "Incorrect amount",
];

/** Feb..Jul in thousands; the final month is filled from live data. */
export const TREND = [27, 31, 30, 35, 34, 0];

export const DAYS_IN_MONTH = 31;

export const TODAY_DATE = new Date(2026, 6, 14);

export const EXPENSES: Expense[] = [
  { id: 1, title: "Studio Rent — July", category: "Rent", amount: 16000, date: "Jul 01, 2026", method: "Bank Transfer", status: "Paid", notes: "", receipt: "rent-jul.pdf" },
  { id: 2, title: "Staff Salaries", category: "Salaries", amount: 12400, date: "Jul 01, 2026", method: "Bank Transfer", status: "Paid", notes: "", receipt: null },
  { id: 3, title: "Electricity Bill", category: "Utilities", amount: 2400, date: "Jul 05, 2026", method: "Apple Pay", status: "Paid", notes: "", receipt: "elec-jul.pdf" },
  { id: 4, title: "Water & Sanitation", category: "Utilities", amount: 520, date: "Jul 05, 2026", method: "Apple Pay", status: "Paid", notes: "", receipt: null },
  { id: 5, title: "New Treadmill Belt", category: "Equipment", amount: 1250, date: "Jul 08, 2026", method: "Card", status: "Paid", notes: "", receipt: null },
  { id: 6, title: "Instagram Ad Campaign", category: "Marketing", amount: 2800, date: "Jul 10, 2026", method: "Card", status: "Pending", notes: "", receipt: null },
  { id: 7, title: "AC Servicing", category: "Maintenance", amount: 780, date: "Jul 11, 2026", method: "Cash", status: "Paid", notes: "", receipt: null },
  { id: 8, title: "Cleaning Supplies", category: "Supplies", amount: 375, date: "Jul 12, 2026", method: "Cash", status: "Paid", notes: "", receipt: null },
  { id: 9, title: "Trainer Bonuses", category: "Salaries", amount: 2100, date: "Jul 12, 2026", method: "Bank Transfer", status: "Pending", notes: "", receipt: null },
  { id: 10, title: "Protein Stock Refill", category: "Supplies", amount: 4800, date: "Jul 13, 2026", method: "Apple Pay", status: "Paid", notes: "", receipt: null },
  { id: 11, title: "Google Ads", category: "Marketing", amount: 1600, date: "Jul 13, 2026", method: "Card", status: "Pending", notes: "", receipt: null },
  { id: 12, title: "Plumbing Repair", category: "Maintenance", amount: 490, date: "Jul 14, 2026", method: "Cash", status: "Paid", notes: "", receipt: null },
];
