import { useCallback, useMemo, useState } from "react";
import type { Order, OrderSort, OrderStatus, PayMethod } from "../../types/sales";
import { ORDERS } from "../../utils/json/salesData";
import { totalOf } from "../../utils/salesUtils";

/*
   Orders page state — the React equivalent of the `state` object plus
   renderKpis()/filtered() in tailwind/src/assets/js/orders.js.
*/

export type OrderTab = "All" | OrderStatus;

export const ORDER_TABS: OrderTab[] = [
  "All",
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
];

/** "All" plus each payment method, for the payment filter <select>. */
export type PayFilter = "All" | PayMethod;

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [tab, setTab] = useState<OrderTab>("All");
  const [search, setSearch] = useState("");
  const [pay, setPay] = useState<PayFilter>("All");
  const [sort, setSort] = useState<OrderSort>("recent");

  const kpis = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "Pending").length,
      completed: orders.filter((order) => order.status === "Completed").length,
      // Revenue counts completed orders only.
      revenue: orders
        .filter((order) => order.status === "Completed")
        .reduce((sum, order) => sum + totalOf(order), 0),
    }),
    [orders],
  );

  const counts = useMemo(() => {
    const base: Record<OrderTab, number> = {
      All: orders.length,
      Pending: 0,
      Processing: 0,
      Completed: 0,
      Cancelled: 0,
    };
    orders.forEach((order) => {
      base[order.status] += 1;
    });
    return base;
  }, [orders]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    const list = orders.filter((order) => {
      const matchesQuery =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query);
      const matchesTab = tab === "All" || order.status === tab;
      const matchesPay = pay === "All" || order.pay === pay;
      return matchesQuery && matchesTab && matchesPay;
    });

    return [...list].sort((a, b) => {
      if (sort === "amount-desc") return totalOf(b) - totalOf(a);
      if (sort === "amount-asc") return totalOf(a) - totalOf(b);
      return b.ts - a.ts;
    });
  }, [orders, search, tab, pay, sort]);

  const markComplete = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: "Completed" } : order)),
    );
  }, []);

  return {
    orders,
    tab,
    setTab,
    search,
    setSearch,
    pay,
    setPay,
    sort,
    setSort,
    kpis,
    counts,
    visible,
    markComplete,
  };
}

export default useOrders;
