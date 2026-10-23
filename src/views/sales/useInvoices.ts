import { useCallback, useMemo, useState } from "react";
import type { Invoice, InvoiceSort, InvoiceStatus } from "../../types/sales";
import { INVOICES, TAX_RATE } from "../../utils/json/salesData";
import { formatSeedDate, round2, totalOf } from "../../utils/salesUtils";

/*
   Invoices page state — the React equivalent of the module-level `state`
   object plus renderKpis()/filtered() in tailwind/src/assets/js/invoices.js.

   The template mutated the INVOICES array in place and called renderAll();
   here every mutation replaces the array so React re-renders, and the KPIs
   and tab counts are derived rather than written into the DOM.
*/

export type InvoiceTab = "All" | InvoiceStatus;

export const INVOICE_TABS: InvoiceTab[] = ["All", "Paid", "Unpaid", "Overdue", "Draft"];

export type CreateInvoiceInput = {
  customer: string;
  email: string;
  item: string;
  amount: number;
  due: Date | null;
  status: InvoiceStatus;
};

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [tab, setTab] = useState<InvoiceTab>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<InvoiceSort>("recent");

  const kpis = useMemo(() => {
    const sum = (list: Invoice[]) => list.reduce((total, invoice) => total + totalOf(invoice), 0);
    return {
      // Drafts are excluded — they have not been issued yet.
      totalInvoiced: sum(invoices.filter((i) => i.status !== "Draft")),
      paid: sum(invoices.filter((i) => i.status === "Paid")),
      outstanding: sum(invoices.filter((i) => i.status === "Unpaid" || i.status === "Overdue")),
      overdueCount: invoices.filter((i) => i.status === "Overdue").length,
    };
  }, [invoices]);

  const counts = useMemo(() => {
    const base: Record<InvoiceTab, number> = {
      All: invoices.length,
      Paid: 0,
      Unpaid: 0,
      Overdue: 0,
      Draft: 0,
    };
    invoices.forEach((invoice) => {
      base[invoice.status] += 1;
    });
    return base;
  }, [invoices]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    const list = invoices.filter((invoice) => {
      const matchesQuery =
        !query ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.customer.toLowerCase().includes(query);
      const matchesTab = tab === "All" || invoice.status === tab;
      return matchesQuery && matchesTab;
    });

    // Copied before sorting so the source array keeps its insertion order.
    return [...list].sort((a, b) => {
      if (sort === "amount-desc") return totalOf(b) - totalOf(a);
      if (sort === "amount-asc") return totalOf(a) - totalOf(b);
      if (sort === "due") return a.ts - b.ts;
      return b.ts - a.ts;
    });
  }, [invoices, search, tab, sort]);

  const markPaid = useCallback((id: string) => {
    setInvoices((prev) =>
      prev.map((invoice) => (invoice.id === id ? { ...invoice, status: "Paid" } : invoice)),
    );
  }, []);

  const createInvoice = useCallback((input: CreateInvoiceInput) => {
    /* The form captures a gross amount, so the line-item price is the
       tax-exclusive value — matching createInvoice() in the template. */
    const price = round2(input.amount / (1 + TAX_RATE));

    setInvoices((prev) => {
      const number = 119 + prev.filter((i) => /^INV-2026-\d+$/.test(i.id)).length;
      const created: Invoice = {
        id: "INV-2026-" + number,
        customer: input.customer.trim(),
        email: input.email.trim(),
        issued: "Today",
        due: formatSeedDate(input.due, "—"),
        status: input.status,
        ts: 200 + prev.length,
        items: [{ name: input.item.trim(), qty: 1, price }],
      };
      return [created, ...prev];
    });
  }, []);

  return {
    invoices,
    tab,
    setTab,
    search,
    setSearch,
    sort,
    setSort,
    kpis,
    counts,
    visible,
    markPaid,
    createInvoice,
  };
}

export default useInvoices;
