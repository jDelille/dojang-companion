import { useCallback, useMemo, useState } from "react";
import type {
  Supplier,
  SupplierFormValues,
  SupplierView,
} from "../../types/suppliers";
import { PO_SEQ_START, SUPPLIERS } from "../../utils/json/suppliersData";
import { moneyWhole, usd } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Suppliers state — ported from tailwind/src/assets/js/suppliers.js. Owns the
   grid/list view, search and the category + status filters, derives the KPIs
   and the filtered vendor list, and holds every mutation.
*/

export function useSuppliers() {
  const { message, visible, showToast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [poSeq, setPoSeq] = useState(PO_SEQ_START);
  const [view, setView] = useState<SupplierView>("grid");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");

  const find = useCallback(
    (id: number) => suppliers.find((s) => s.id === id) ?? null,
    [suppliers],
  );

  const kpis = useMemo(
    () => ({
      total: suppliers.length,
      active: suppliers.filter((s) => s.status === "Active").length,
      pos: suppliers.reduce((t, s) => t + s.openPOs, 0),
      spend: usd(suppliers.reduce((t, s) => t + s.spend, 0)),
    }),
    [suppliers],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return suppliers.filter((s) => {
      const mq =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      const mc = cat === "All" || s.category === cat;
      const ms = status === "All" || s.status === status;
      return mq && mc && ms;
    });
  }, [suppliers, cat, status, search]);

  /* ---------- Mutations ---------- */

  const saveSupplier = useCallback(
    (values: SupplierFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter a company name");
        return false;
      }

      const data = {
        name,
        category: values.category,
        contact: values.contact.trim() || "—",
        email: values.email.trim() || "—",
        phone: values.phone.trim() || "—",
        city: values.city.trim() || "Austin",
        rating: Number(values.rating) || 4,
        status: values.status,
      };

      if (editId != null) {
        setSuppliers((prev) => prev.map((s) => (s.id === editId ? { ...s, ...data } : s)));
        showToast('"' + name + '" updated');
      } else {
        setSuppliers((prev) => [
          {
            ...data,
            id: prev.reduce((max, s) => Math.max(max, s.id), 0) + 1,
            openPOs: 0,
            spend: 0,
          },
          ...prev,
        ]);
        showToast('"' + name + '" added');
      }
      return true;
    },
    [showToast],
  );

  /** Creating a PO bumps the vendor's open count and year-to-date spend. */
  const createPO = useCallback(
    (id: number, qty: number, price: number) => {
      const s = find(id);
      if (!s) return false;

      const quantity = Math.max(0, Number(qty) || 0);
      const unitPrice = Math.max(0, Number(price) || 0);
      if (quantity < 1 || unitPrice <= 0) {
        showToast("Enter quantity and unit price");
        return false;
      }

      const amount = quantity * unitPrice;
      setSuppliers((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, openPOs: x.openPOs + 1, spend: x.spend + amount } : x,
        ),
      );
      setPoSeq((prev) => prev + 1);
      showToast("PO created · " + moneyWhole(amount) + " to " + s.name);
      return true;
    },
    [find, showToast],
  );

  /** Recording a payment optionally closes one of the vendor's open POs. */
  const recordPayment = useCallback(
    (id: number, amount: number, method: string, closePO: boolean) => {
      const s = find(id);
      if (!s) return false;

      const value = Math.max(0, Number(amount) || 0);
      if (value <= 0) {
        showToast("Enter a payment amount");
        return false;
      }

      if (closePO) {
        setSuppliers((prev) =>
          prev.map((x) =>
            x.id === id && x.openPOs > 0 ? { ...x, openPOs: x.openPOs - 1 } : x,
          ),
        );
      }
      showToast(moneyWhole(value) + " paid to " + s.name + " via " + method);
      return true;
    },
    [find, showToast],
  );

  /** The channel option is "Email — a@b.com"; only the label before " — " is used. */
  const contactSupplier = useCallback(
    (id: number, channel: string, messageText: string) => {
      const s = find(id);
      if (!s) return false;
      if (!messageText.trim()) {
        showToast("Type a message first");
        return false;
      }
      showToast("Message sent to " + s.contact + " via " + channel.split(" — ")[0]);
      return true;
    },
    [find, showToast],
  );

  const deleteSupplier = useCallback(
    (id: number) => {
      const s = find(id);
      setSuppliers((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (s?.name ?? "Supplier") + '" removed');
    },
    [find, showToast],
  );

  const exportSuppliers = useCallback(
    () => showToast("Supplier list exported"),
    [showToast],
  );

  return {
    suppliers,
    filtered,
    kpis,
    poSeq,
    view,
    setView,
    search,
    setSearch,
    cat,
    setCat,
    status,
    setStatus,
    find,
    saveSupplier,
    createPO,
    recordPayment,
    contactSupplier,
    deleteSupplier,
    exportSuppliers,
    toast: { message, visible },
  };
}

export default useSuppliers;
