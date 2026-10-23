import { useState } from "react";
import {
  Barcode,
  CircleX,
  DollarSign,
  Download,
  Eye,
  Layers,
  LayoutGrid,
  List,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import type { Product } from "../../types/products";
import { PRODUCT_CATS } from "../../utils/json/productsData";
import { all_routes } from "../../routes/all_routes";
import { moneyWhole } from "../../utils/formatUtils";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import { PRODUCT_CAT_FALLBACK, PRODUCT_CAT_ICON } from "./productIcons";
import useProducts, { stockBadgeCls, stockStateOf } from "./useProducts";
import ProductFormModal from "./modal/productFormModal";
import ProductViewModal from "./modal/productViewModal";
import ProductStockModal from "./modal/productStockModal";
import ProductBarcodeModal from "./modal/productBarcodeModal";
import ProductImportModal from "./modal/productImportModal";
import ProductDeleteModal from "./modal/productDeleteModal";
import Link from "next/link";

/*
   Products — ported from tailwind/src/products.html and assets/js/products.js.
   Catalog cards / list, category chips, filters, sorting and the full modal suite.

   The template's "Sell in POS" action was a raw `window.location = 'pos.html'`;
   here it becomes a react-router <Link> to the POS route.
*/

type ModalKind = "form" | "view" | "stock" | "barcode" | "import" | "delete";

const Products = () => {
  const page = useProducts();
  const {
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
  } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const menuFor = (p: Product, triggerClassName: string) => (
    <RowMenu
      triggerClassName={triggerClassName}
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", p.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", p.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Product
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("stock", p.id)}>
        <Layers className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Stock Update
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("barcode", p.id)}>
        <Barcode className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Barcode
      </button>
      <Link href={all_routes.pos} className="dropdown-item">
        <ShoppingCart className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Sell in POS
      </Link>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", p.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </RowMenu>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Products</h2>
          <p className="text-sm mt-0.5 c-dim">
            Manage your supplements, gear &amp; retail catalog · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setModal("import")}
          >
            <Upload className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Import
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportProducts}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Product
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-inventory reveal">
          <div className="icon-box ic-gold">
            <Package className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Products</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-orange">
            <TriangleAlert className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.low}</div>
            <div className="text-xs font-medium mt-1 c-dim">Low Stock</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-red">
            <CircleX className="w-[18px] h-[18px] c-red shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.out}</div>
            <div className="text-xs font-medium mt-1 c-dim">Out of Stock</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-green">
            <DollarSign className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.value}</div>
            <div className="text-xs font-medium mt-1 c-dim">Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search products by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="fp-input py-2 text-sm w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
        <select
          className="fp-input py-2 text-sm w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="name">Sort: Name</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="stock">Stock: Low → High</option>
        </select>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={view === "grid" ? "view-btn active" : "view-btn"}
            title="Grid view"
            aria-label="Grid view"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={view === "list" ? "view-btn active" : "view-btn"}
            title="List view"
            aria-label="List view"
            onClick={() => setView("list")}
          >
            <List className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          type="button"
          className={cat === "All" ? "cat-btn active" : "cat-btn"}
          onClick={() => setCat("All")}
        >
          All Categories
        </button>
        {PRODUCT_CATS.map((value) => (
          <button
            key={value}
            type="button"
            className={cat === value ? "cat-btn active" : "cat-btn"}
            onClick={() => setCat(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Grid view */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5${view !== "grid" || filtered.length === 0 ? " hidden" : ""}`}
      >
        {filtered.map((p, index) => {
          const Icon = PRODUCT_CAT_ICON[p.category] ?? PRODUCT_CAT_FALLBACK;
          return (
            <div
              key={p.id}
              className="prod-card reveal"
              style={{ animationDelay: `${Math.min(index * 35, 400)}ms` }}
            >
              <div className="prod-media">
                <span className={`badge ${stockBadgeCls(p)} stock-pill`}>
                  <span className="dot" />
                  {stockStateOf(p)}
                </span>
                <div className="card-tools">
                  <button
                    type="button"
                    className={p.fav ? "fav-btn on" : "fav-btn"}
                    aria-label="Favorite"
                    onClick={() => page.toggleFav(p.id)}
                  >
                    <Star
                      className="w-[15px] h-[15px] shrink-0"
                      style={p.fav ? { fill: "currentColor" } : undefined}
                      aria-hidden="true"
                    />
                  </button>
                  {menuFor(p, "fav-btn")}
                </div>
                <div className="prod-ic">
                  <Icon
                    style={{ width: "26px", height: "26px", color: "#D4AF37" }}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider c-gold">
                    {p.category}
                  </span>
                  <span className="text-[10px] c-dim2 font-mono">{p.sku}</span>
                </div>
                <div className="text-sm font-bold c-text mb-2 truncate">{p.name}</div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-black gt">{moneyWhole(p.price)}</div>
                  <div className="text-[11px] c-dim">{p.stock} in stock</div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 bd-t">
                  <button
                    type="button"
                    className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => open("form", p.id)}
                  >
                    <Pencil className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    Edit
                  </button>
                  <Link
                    href={all_routes.pos}
                    className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    Sell
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List view */}
      <div
        className={`glass-card overflow-hidden${view !== "list" || filtered.length === 0 ? " hidden" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const Icon = PRODUCT_CAT_ICON[p.category] ?? PRODUCT_CAT_FALLBACK;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="prow-ic">
                          <Icon
                            className="w-[16px] h-[16px] c-gold shrink-0"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="font-semibold c-text">{p.name}</div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td className="font-mono text-xs c-dim">{p.sku}</td>
                    <td className="font-bold c-text">{moneyWhole(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`badge ${stockBadgeCls(p)}`}>
                        <span className="dot" />
                        {stockStateOf(p)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="icon-btn view"
                          title="View"
                          onClick={() => open("view", p.id)}
                        >
                          <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit"
                          onClick={() => open("form", p.id)}
                        >
                          <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        {menuFor(p, "icon-btn")}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      <div className={`text-center py-16${filtered.length === 0 ? "" : " hidden"}`}>
        <div className="text-[42px] opacity-30 mb-2">📦</div>
        <div className="text-sm font-bold c-text">No products found</div>
        <div className="text-xs mt-1 c-dim">
          Try a different search, category, or status filter
        </div>
      </div>

      {/* Footer count */}
      <div className="flex items-center justify-between mt-5 text-xs c-dim2">
        <span>
          Showing <span>{filtered.length}</span> of <span>{products.length}</span> products
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <ProductFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveProduct}
      />
      <ProductViewModal
        product={modal === "view" ? target : null}
        onClose={close}
        onStock={() => setModal("stock")}
        onEdit={() => setModal("form")}
      />
      <ProductStockModal
        key={`stock-${target?.id ?? "none"}`}
        product={modal === "stock" ? target : null}
        onClose={close}
        onConfirm={page.updateStock}
      />
      <ProductBarcodeModal
        product={modal === "barcode" ? target : null}
        onClose={close}
        onPrint={page.printBarcode}
      />
      <ProductImportModal
        open={modal === "import"}
        onClose={close}
        onConfirm={page.importProducts}
      />
      <ProductDeleteModal
        product={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteProduct}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Products;
