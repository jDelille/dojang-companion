import { useCallback, useMemo, useState } from "react";
import type { Txn, TxnMethod, TxnStatus } from "../../types/sales";
import { METHOD_ORDER, TXNS } from "../../utils/json/salesData";

/*
   Payments page state — the React equivalent of the `state` object plus
   renderKpis()/renderMix()/renderRefunds()/filtered() in
   tailwind/src/assets/js/payments.js.
*/

export type TxnTab = "All" | TxnStatus;

export const TXN_TABS: TxnTab[] = ["All", "Success", "Pending", "Failed", "Refunded"];

/** "All" plus each method, for the method filter <select>. */
export type MethodFilter = "All" | TxnMethod;

export type RecordPaymentInput = {
  customer: string;
  date: Date | null;
  amount: number;
  method: TxnMethod;
};

/** One row of the Payment Methods mix and of the settlement breakdown. */
export type MethodTotal = {
  method: TxnMethod;
  amount: number;
  count: number;
  /** Share of the successful total, rounded — used for the bar width. */
  percent: number;
};

export function usePayments() {
  const [txns, setTxns] = useState<Txn[]>(TXNS);
  const [tab, setTab] = useState<TxnTab>("All");
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<MethodFilter>("All");

  const succeeded = useMemo(() => txns.filter((txn) => txn.status === "Success"), [txns]);

  const kpis = useMemo(() => {
    const sum = (list: Txn[]) => list.reduce((total, txn) => total + txn.amount, 0);
    return {
      received: sum(succeeded),
      today: sum(succeeded.filter((txn) => txn.today)),
      pending: sum(txns.filter((txn) => txn.status === "Pending")),
      refunded: sum(txns.filter((txn) => txn.status === "Refunded")),
    };
  }, [succeeded, txns]);

  const counts = useMemo(() => {
    const base: Record<TxnTab, number> = {
      All: txns.length,
      Success: 0,
      Pending: 0,
      Failed: 0,
      Refunded: 0,
    };
    txns.forEach((txn) => {
      base[txn.status] += 1;
    });
    return base;
  }, [txns]);

  /*
     Successful volume per method, largest first. The template divided by 1
     when there were no successes, so an empty list yields 0% rather than NaN.
  */
  const methodTotals = useMemo<MethodTotal[]>(() => {
    const total = succeeded.reduce((sum, txn) => sum + txn.amount, 0) || 1;
    return METHOD_ORDER.map((name) => {
      const rows = succeeded.filter((txn) => txn.method === name);
      const amount = rows.reduce((sum, txn) => sum + txn.amount, 0);
      return {
        method: name,
        amount,
        count: rows.length,
        percent: Math.round((amount / total) * 100),
      };
    })
      .filter((row) => row.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [succeeded]);

  const refunds = useMemo(() => txns.filter((txn) => txn.status === "Refunded"), [txns]);

  /** Net payout shown in the settlements modal. */
  const settlementTotal = useMemo(
    () => succeeded.reduce((sum, txn) => sum + txn.amount, 0),
    [succeeded],
  );

  /* Settlement rows keep METHOD_ORDER, unlike the mix which sorts by amount. */
  const settlementRows = useMemo<MethodTotal[]>(
    () =>
      METHOD_ORDER.map((name) => {
        const rows = succeeded.filter((txn) => txn.method === name);
        const amount = rows.reduce((sum, txn) => sum + txn.amount, 0);
        return { method: name, amount, count: rows.length, percent: 0 };
      }).filter((row) => row.amount > 0),
    [succeeded],
  );

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return txns
      .filter((txn) => {
        const matchesQuery =
          !query ||
          txn.id.toLowerCase().includes(query) ||
          txn.customer.toLowerCase().includes(query);
        const matchesTab = tab === "All" || txn.status === tab;
        const matchesMethod = method === "All" || txn.method === method;
        return matchesQuery && matchesTab && matchesMethod;
      })
      .sort((a, b) => b.ts - a.ts);
  }, [txns, search, tab, method]);

  /** Only successful transactions can be refunded. */
  const refund = useCallback((id: string) => {
    setTxns((prev) =>
      prev.map((txn) =>
        txn.id === id && txn.status === "Success" ? { ...txn, status: "Refunded" } : txn,
      ),
    );
  }, []);

  const recordPayment = useCallback((input: RecordPaymentInput) => {
    setTxns((prev) => {
      const created: Txn = {
        id: "TXN-" + (prev.length + 90232),
        customer: input.customer.trim(),
        method: input.method,
        amount: input.amount,
        status: "Success",
        /* The template reformatted the picker's "14 Jul, 2026" into
           "Jul 14, 2026, 12:00 PM", falling back to "Just now". */
        date: input.date
          ? `${input.date.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}, 12:00 PM`
          : "Just now",
        today: true,
        ts: 300 + prev.length,
      };
      return [created, ...prev];
    });
  }, []);

  return {
    txns,
    tab,
    setTab,
    search,
    setSearch,
    method,
    setMethod,
    kpis,
    counts,
    visible,
    methodTotals,
    refunds,
    settlementTotal,
    settlementRows,
    refund,
    recordPayment,
  };
}

export default usePayments;
