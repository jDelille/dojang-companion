import { useCallback, useMemo, useState } from "react";
import type {
  Product,
  ProductFormValues,
  ProductSort,
  ProductStockState,
  ProductView,
} from "../../types/products";
import { LOW_THRESHOLD, PRODUCTS } from "../../utils/json/productsData";
import { moneyWhole } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Products state — ported from tailwind/src/assets/js/products.js. Owns the
   search, category chips, status filter, sort and grid/list view, derives the
   KPIs and the sorted+filtered catalog, and holds every mutation.
*/

/** stockState(p) — the three-way stock label from the template. */
export const stockStateOf = (p: Product): ProductStockState =>
  p.stock === 0 ? "Out of Stock" : p.stock <= LOW_THRESHOLD ? "Low Stock" : "In Stock";

/** stockBadgeCls(p) — the badge class matching the stock state. */
export const stockBadgeCls = (p: Product): string => {
  const s = stockStateOf(p);
  return s === "Out of Stock"
    ? "badge-absent"
    : s === "Low Stock"
      ? "badge-late"
      : "badge-present";
};

/*
   barcodeBars() — deterministic bar pattern seeded from `sku + id`, ported from
   assets/js/products.js. The template emits 44 <i> elements whose class is
   "gap", "thin", or empty (the wide bar), so the third case must stay "".
*/
export const barcodeBars = (seed: string): string[] => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  const bars = 44;
  const out: string[] = [];
  for (let i = 0; i < bars; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const r = h % 3;
    out.push(r === 0 ? "gap" : r === 1 ? "thin" : "");
  }
  return out;
};

export function useProducts() {
  const { message, visible, showToast } = useToast();

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<ProductSort>("name");
  const [view, setView] = useState<ProductView>("grid");

  const find = useCallback(
    (id: number) => products.find((p) => p.id === id) ?? null,
    [products],
  );

  const kpis = useMemo(
    () => ({
      total: products.length,
      low: products.filter((p) => stockStateOf(p) === "Low Stock").length,
      out: products.filter((p) => p.stock === 0).length,
      value: moneyWhole(products.reduce((sum, p) => sum + p.price * p.stock, 0)),
    }),
    [products],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = products.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCat = cat === "All" || p.category === cat;
      const matchStatus = status === "All" || stockStateOf(p) === status;
      return matchQ && matchCat && matchStatus;
    });
    return list.slice().sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "stock") return a.stock - b.stock;
      return a.name.localeCompare(b.name);
    });
  }, [products, search, cat, status, sort]);

  /* ---------- Mutations ---------- */

  const toggleFav = useCallback(
    (id: number) => {
      const p = find(id);
      if (!p) return;
      const next = !p.fav;
      setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, fav: next } : x)));
      showToast(next ? "Added to favorites" : "Removed from favorites");
    },
    [find, showToast],
  );

  const saveProduct = useCallback(
    (values: ProductFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter a product name");
        return false;
      }

      const data = {
        name,
        category: values.category,
        sku: values.sku.trim() || "NEW-" + String(products.length + 1).padStart(3, "0"),
        price: Number(values.price) || 0,
        stock: Number(values.stock) || 0,
      };

      if (editId != null) {
        setProducts((prev) => prev.map((x) => (x.id === editId ? { ...x, ...data } : x)));
        showToast('"' + name + '" updated');
      } else {
        setProducts((prev) => [
          { ...data, id: prev.reduce((max, x) => Math.max(max, x.id), 0) + 1, fav: false },
          ...prev,
        ]);
        showToast('"' + name + '" added to catalog');
      }
      return true;
    },
    [products, showToast],
  );

  const updateStock = useCallback(
    (id: number, qty: number) => {
      const p = find(id);
      if (!p) return;
      const next = Math.max(0, Number(qty) || 0);
      setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, stock: next } : x)));
      showToast("Stock updated · " + p.name + " → " + next + " units");
    },
    [find, showToast],
  );

  const deleteProduct = useCallback(
    (id: number) => {
      const p = find(id);
      setProducts((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (p?.name ?? "Product") + '" removed');
    },
    [find, showToast],
  );

  const exportProducts = useCallback(
    () => showToast("Product catalog exported"),
    [showToast],
  );
  const importProducts = useCallback(
    () => showToast("Catalog imported from CSV"),
    [showToast],
  );
  const printBarcode = useCallback(() => showToast("Barcode sent to printer"), [showToast]);

  return {
    products,
    filtered,
    kpis,
    search,
    setSearch,
    cat,
    setCat,
    status,
    setStatus,
    sort,
    setSort,
    view,
    setView,
    find,
    toggleFav,
    saveProduct,
    updateStock,
    deleteProduct,
    exportProducts,
    importProducts,
    printBarcode,
    toast: { message, visible },
  };
}

export default useProducts;
