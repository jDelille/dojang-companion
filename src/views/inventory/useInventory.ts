import { useCallback, useMemo, useState } from "react";
import type {
  AdjustmentValues,
  InventoryFormValues,
  InventoryItem,
  MovementType,
  StockLevel,
  StockMovement,
  TransferValues,
} from "../../types/inventory";
import { INVENTORY_ITEMS, INVENTORY_MOVES } from "../../utils/json/inventoryData";
import { moneyWhole } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Inventory state — ported from tailwind/src/assets/js/inventory.js. Owns the
   search / category / level filters, derives the KPIs, the filtered stock
   table, the reorder alerts and the movement log, and holds every mutation.
*/

/** level(it) — the stock level ladder from the template. */
export const levelOf = (it: InventoryItem): StockLevel => {
  if (it.onHand === 0) return "Out";
  if (it.onHand <= it.reorder) {
    return it.onHand <= Math.ceil(it.reorder / 2) ? "Reorder" : "Low";
  }
  return "Healthy";
};

const LOW_LEVELS: StockLevel[] = ["Low", "Reorder", "Out"];

/** Bar width for the level track: Math.max(6, Math.min(100, …)). */
export const levelPct = (it: InventoryItem) =>
  Math.max(6, Math.min(100, Math.round((it.onHand / (it.reorder * 3 || 1)) * 100)));

export function useInventory() {
  const { message, visible, showToast } = useToast();

  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [moves, setMoves] = useState<StockMovement[]>(INVENTORY_MOVES);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");

  const find = useCallback(
    (id: number) => items.find((x) => x.id === id) ?? null,
    [items],
  );

  const kpis = useMemo(
    () => ({
      skus: items.length,
      value: moneyWhole(items.reduce((s, it) => s + it.price * it.onHand, 0)),
      low: items.filter((it) => LOW_LEVELS.includes(levelOf(it))).length,
      incoming: items.reduce((s, it) => s + it.incoming, 0),
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((it) => {
      const mq = !q || it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q);
      const mc = cat === "All" || it.category === cat;
      const ms = status === "All" || levelOf(it) === status;
      return mq && mc && ms;
    });
  }, [items, search, cat, status]);

  /** Low/Reorder/Out items, lowest on-hand first. */
  const alerts = useMemo(
    () =>
      items
        .filter((it) => LOW_LEVELS.includes(levelOf(it)))
        .slice()
        .sort((a, b) => a.onHand - b.onHand),
    [items],
  );

  const recentMoves = useMemo(() => moves.slice(0, 5), [moves]);

  /* ---------- Mutations ---------- */

  const logMove = useCallback(
    (type: MovementType, item: string, qty: number, ref?: string) => {
      setMoves((prev) =>
        [{ type, item, qty, ref: ref || "Manual", when: "just now" }, ...prev].slice(0, 30),
      );
    },
    [],
  );

  /** setStock() — inline stepper on the table row. */
  const setStock = useCallback(
    (id: number, next: number, refLabel?: string) => {
      const it = find(id);
      if (!it) return;
      const delta = next - it.onHand;
      if (delta === 0) return;
      const value = Math.max(0, next);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, onHand: value } : x)));
      logMove(delta > 0 ? "in" : "adj", it.name, delta, refLabel || "Manual");
    },
    [find, logMove],
  );

  const saveItem = useCallback(
    (values: InventoryFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter an item name");
        return false;
      }

      const data = {
        name,
        sku: values.sku.trim() || "NEW-" + String(items.length + 1).padStart(3, "0"),
        category: values.category,
        price: Number(values.price) || 0,
        onHand: Math.max(0, Number(values.onHand) || 0),
        reorder: Math.max(0, Number(values.reorder) || 0),
      };

      if (editId != null) {
        setItems((prev) => prev.map((x) => (x.id === editId ? { ...x, ...data } : x)));
        showToast('"' + name + '" updated');
      } else {
        setItems((prev) => [
          ...prev,
          { ...data, id: prev.reduce((max, x) => Math.max(max, x.id), 0) + 1, incoming: 0 },
        ]);
        logMove("in", name, data.onHand, "New item");
        showToast('"' + name + '" added to inventory');
      }
      return true;
    },
    [items, logMove, showToast],
  );

  const adjustStock = useCallback(
    (id: number, values: AdjustmentValues) => {
      const it = find(id);
      if (!it) return false;
      const qty = Math.max(0, Number(values.qty) || 0);
      if (qty === 0 && values.type !== "Set to") {
        showToast("Enter a quantity");
        return false;
      }
      let next = it.onHand;
      if (values.type === "Add stock") next = it.onHand + qty;
      else if (values.type === "Remove stock") next = it.onHand - qty;
      else next = qty;
      next = Math.max(0, next);
      const delta = next - it.onHand;
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, onHand: next } : x)));
      logMove(delta >= 0 ? "in" : "adj", it.name, delta, values.reason);
      showToast(it.name + " → " + next + " units (" + values.reason + ")");
      return true;
    },
    [find, logMove, showToast],
  );

  const transferStock = useCallback(
    (id: number, values: TransferValues) => {
      const it = find(id);
      if (!it) return false;
      const qty = Math.max(0, Number(values.qty) || 0);
      if (qty < 1) {
        showToast("Enter a quantity to transfer");
        return false;
      }
      if (qty > it.onHand) {
        showToast("Only " + it.onHand + " units available");
        return false;
      }
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, onHand: x.onHand - qty } : x)),
      );
      logMove("out", it.name, -qty, "Transfer → " + values.to);
      showToast("Transferred " + qty + " × " + it.name + " to " + values.to);
      return true;
    },
    [find, logMove, showToast],
  );

  const deleteItem = useCallback(
    (id: number) => {
      const it = find(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (it?.name ?? "Item") + '" removed');
    },
    [find, showToast],
  );

  const exportInventory = useCallback(() => showToast("Inventory exported"), [showToast]);
  const importInventory = useCallback(
    () => showToast("Inventory imported from CSV"),
    [showToast],
  );
  const saveChanges = useCallback(() => showToast("Stock changes saved"), [showToast]);

  return {
    items,
    moves,
    recentMoves,
    filtered,
    alerts,
    kpis,
    search,
    setSearch,
    cat,
    setCat,
    status,
    setStatus,
    find,
    setStock,
    saveItem,
    adjustStock,
    transferStock,
    deleteItem,
    exportInventory,
    importInventory,
    saveChanges,
    toast: { message, visible },
  };
}

export default useInventory;
