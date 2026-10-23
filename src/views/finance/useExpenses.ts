import { useCallback, useMemo, useState } from "react";
import type { Expense, ExpenseCategory, ExpenseFormValues } from "../../types/expenses";
import {
  CAT_META,
  DAYS_IN_MONTH,
  EXPENSES,
  TREND,
} from "../../utils/json/expensesData";
import { moneyWhole, usd } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Expenses state — ported from tailwind/src/assets/js/expenses.js. Owns the
   status tab, category filter and search, and derives the KPIs, the category
   breakdown, the 6-month trend bars and the filtered table.
*/

/** "Jul 14, 2026" — the format fmtDate() produced. */
export const fmtDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "Jul 14, 2026";

/** Parses a seed date string back to a Date for the edit form. */
export const parseDate = (value: string | undefined, fallback: Date) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

export function useExpenses() {
  const { message, visible, showToast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [tab, setTab] = useState("All");
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const find = useCallback(
    (id: number) => expenses.find((e) => e.id === id) ?? null,
    [expenses],
  );

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  /** Per-category sums, sorted high to low — drives both the KPI and breakdown. */
  const categoryTotals = useMemo(() => {
    const m = {} as Record<ExpenseCategory, number>;
    expenses.forEach((e) => {
      m[e.category] = (m[e.category] ?? 0) + e.amount;
    });
    return (Object.keys(m) as ExpenseCategory[])
      .sort((a, b) => m[b] - m[a])
      .map((category) => ({
        category,
        amount: m[category],
        pct: Math.round((m[category] / (total || 1)) * 100),
        meta: CAT_META[category],
      }));
  }, [expenses, total]);

  const kpis = useMemo(
    () => ({
      total: usd(total),
      avg: usd(Math.round(total / DAYS_IN_MONTH)),
      top: categoryTotals[0]?.category ?? "—",
      pending: expenses.filter((e) => e.status === "Pending").length,
    }),
    [expenses, total, categoryTotals],
  );

  /** Six trend bars; the last month is the live total, in thousands. */
  const trend = useMemo(() => {
    const values = TREND.slice();
    values[5] = Math.round(total / 1000);
    const max = Math.max(...values) || 1;
    return values.map((value, i) => ({
      value,
      height: Math.max(6, Math.round((value / max) * 100)),
      isCurrent: i === 5,
    }));
  }, [total]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return expenses.filter((e) => {
      const mq =
        !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const mt = tab === "All" || e.status === tab;
      const mc = cat === "All" || e.category === cat;
      return mq && mt && mc;
    });
  }, [expenses, tab, cat, search]);

  const filteredTotal = useMemo(
    () => moneyWhole(filtered.reduce((s, e) => s + e.amount, 0)),
    [filtered],
  );

  /* ---------- Mutations ---------- */

  const saveExpense = useCallback(
    (values: ExpenseFormValues, editId: number | null) => {
      const title = values.title.trim();
      if (!title) {
        showToast("Enter a description");
        return false;
      }

      const data = {
        title,
        category: values.category,
        amount: Number(values.amount) || 0,
        date: fmtDate(values.date),
        method: values.method,
        notes: values.notes.trim(),
      };

      if (editId != null) {
        setExpenses((prev) => prev.map((e) => (e.id === editId ? { ...e, ...data } : e)));
        showToast("Expense updated");
      } else {
        setExpenses((prev) => [
          {
            ...data,
            id: prev.reduce((max, e) => Math.max(max, e.id), 0) + 1,
            status: "Pending" as const,
            receipt: null,
          },
          ...prev,
        ]);
        showToast("Expense added");
      }
      return true;
    },
    [showToast],
  );

  const approveExpense = useCallback(
    (id: number) => {
      const e = find(id);
      setExpenses((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "Paid" as const } : x)),
      );
      if (e) showToast('"' + e.title + '" approved');
    },
    [find, showToast],
  );

  /** Rejecting appends the reason to the expense's notes, as confirmReject() did. */
  const rejectExpense = useCallback(
    (id: number, reason: string) => {
      const e = find(id);
      setExpenses((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: "Rejected" as const,
                notes: (x.notes ? x.notes + " · " : "") + "Rejected: " + reason,
              }
            : x,
        ),
      );
      if (e) showToast('"' + e.title + '" rejected');
    },
    [find, showToast],
  );

  const attachReceipt = useCallback(
    (id: number) => {
      const e = find(id);
      setExpenses((prev) =>
        prev.map((x) => (x.id === id ? { ...x, receipt: "receipt-" + x.id + ".pdf" } : x)),
      );
      if (e) showToast('Receipt attached to "' + e.title + '"');
    },
    [find, showToast],
  );

  const deleteExpense = useCallback(
    (id: number) => {
      const e = find(id);
      setExpenses((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (e?.title ?? "Expense") + '" deleted');
    },
    [find, showToast],
  );

  const exportExpenses = useCallback(() => showToast("Expenses exported"), [showToast]);

  return {
    expenses,
    filtered,
    filteredTotal,
    categoryTotals,
    trend,
    kpis,
    tab,
    setTab,
    cat,
    setCat,
    search,
    setSearch,
    find,
    saveExpense,
    approveExpense,
    rejectExpense,
    attachReceipt,
    deleteExpense,
    exportExpenses,
    toast: { message, visible },
  };
}

export default useExpenses;
