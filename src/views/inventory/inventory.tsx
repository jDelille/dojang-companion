import { useState } from "react";
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  Download,
  Eye,
  History,
  Minus,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  Truck,
  Upload,
} from "lucide-react";
import type { InventoryItem } from "../../types/inventory";
import { INVENTORY_CATS, LVL_META } from "../../utils/json/inventoryData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import { CAT_FALLBACK, INVENTORY_CAT_ICON } from "./inventoryIcons";
import useInventory, { levelOf, levelPct } from "./useInventory";
import InventoryFormModal from "./modal/inventoryFormModal";
import InventoryViewModal from "./modal/inventoryViewModal";
import InventoryAdjustModal from "./modal/inventoryAdjustModal";
import InventoryTransferModal from "./modal/inventoryTransferModal";
import InventoryImportModal from "./modal/inventoryImportModal";
import InventoryMovementsModal, { MovementRow } from "./modal/inventoryMovementsModal";
import InventoryDeleteModal from "./modal/inventoryDeleteModal";

/*
   Inventory — ported from tailwind/src/inventory.html and
   assets/js/inventory.js. Stock table with inline steppers, reorder alerts,
   recent movements and the full modal suite.
*/

const LEVELS = ["Healthy", "Low", "Reorder", "Out"];

type ModalKind = "form" | "view" | "adjust" | "transfer" | "import" | "movements" | "delete";

const Inventory = () => {
  const page = useInventory();
  const {
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
  } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Per-row menu — same items the body-singleton menu rendered. */
  const menuFor = (it: InventoryItem) => (
    <RowMenu
      triggerClassName="inv-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", it.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", it.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Item
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("adjust", it.id)}>
        <SlidersHorizontal className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Stock Adjustment
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("transfer", it.id)}>
        <Truck className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Transfer Stock
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", it.id)}>
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
          <h2 className="text-xl font-black c-text">Inventory</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track stock levels, adjustments &amp; movements · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("import", null)}
          >
            <Upload className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Import
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportInventory}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("movements", null)}
          >
            <History className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Movements
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Item
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-inventory reveal">
          <div className="icon-box ic-gold">
            <Boxes className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.skus}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total SKUs</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-green">
            <DollarSign className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.value}</div>
            <div className="text-xs font-medium mt-1 c-dim">Stock Value</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-orange">
            <AlertTriangle className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.low}</div>
            <div className="text-xs font-medium mt-1 c-dim">Low / Reorder</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-cyan">
            <Truck className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.incoming}</div>
            <div className="text-xs font-medium mt-1 c-dim">Incoming Units</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Stock table */}
        <div className="xl:col-span-2">
          {/* Toolbar */}
          <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                className="fp-input pl-9 py-2 text-sm"
                placeholder="Search item or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="fp-input py-2 text-sm w-auto"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="All">All Categories</option>
              {INVENTORY_CATS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              className="fp-input py-2 text-sm w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Levels</option>
              {LEVELS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-3">
              <h3 className="font-bold c-text sec-title">Stock Levels</h3>
              <span className="text-[11px] c-dim">Adjust quantities inline</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table table-sticky min-w-[760px]">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Level</th>
                    <th>On Hand</th>
                    <th>Reorder&nbsp;At</th>
                    <th className="text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => {
                    const lv = levelOf(it);
                    const meta = LVL_META[lv];
                    const Icon = INVENTORY_CAT_ICON[it.category] ?? CAT_FALLBACK;
                    return (
                      <tr key={it.id} onClick={() => open("view", it.id)}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="inv-ic">
                              <Icon
                                className="w-[16px] h-[16px] c-gold shrink-0"
                                aria-hidden="true"
                              />
                            </div>
                            <div>
                              <div className="font-semibold c-text">{it.name}</div>
                              <div className="text-[11px] c-dim">{it.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-xs c-dim">{it.sku}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="lvl-track">
                              <div
                                className="lvl-fill"
                                style={{ width: `${levelPct(it)}%`, background: meta.color }}
                              />
                            </div>
                            <span className={`badge ${meta.badge}`}>{lv}</span>
                          </div>
                        </td>
                        <td className="font-bold c-text">{it.onHand}</td>
                        <td className="c-dim">{it.reorder}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="stepper">
                              <button
                                type="button"
                                aria-label="Decrease"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  page.setStock(it.id, it.onHand - 1, "Manual");
                                }}
                              >
                                <Minus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                              </button>
                              <input type="text" value={it.onHand} readOnly />
                              <button
                                type="button"
                                aria-label="Increase"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  page.setStock(it.id, it.onHand + 1, "Manual");
                                }}
                              >
                                <Plus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                              </button>
                            </div>
                            <span onClick={(e) => e.stopPropagation()}>{menuFor(it)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={`text-center py-14${filtered.length ? " hidden" : ""}`}>
              <div className="text-[38px] opacity-30 mb-2">📦</div>
              <div className="text-sm font-bold c-text">No items found</div>
              <div className="text-xs mt-1 c-dim">Adjust your search or filters</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bd-t">
              <span className="text-xs c-dim2">
                Showing <span>{filtered.length}</span> of <span>{items.length}</span> items
              </span>
              <button
                type="button"
                className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                onClick={page.saveChanges}
              >
                <Save className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Side column: alerts + movements */}
        <div className="space-y-5">
          {/* Reorder alerts */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold c-text sec-title">Reorder Alerts</h3>
              <span className="badge badge-late">{alerts.length}</span>
            </div>
            <div className="space-y-2.5">
              {alerts.length ? (
                alerts.map((it) => {
                  const Icon = INVENTORY_CAT_ICON[it.category] ?? CAT_FALLBACK;
                  return (
                    <div key={it.id} className="list-row flex items-center gap-3 p-2.5">
                      <div className="inv-ic">
                        <Icon className="w-[15px] h-[15px] c-gold shrink-0" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold c-text truncate">{it.name}</div>
                        <div className="text-[11px] c-dim">
                          {it.onHand} left · reorder at {it.reorder}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-ghost px-2.5 py-1 text-[11px]"
                        onClick={() => open("adjust", it.id)}
                      >
                        Restock
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs c-dim text-center py-4">All stock levels are healthy ✓</div>
              )}
            </div>
          </div>

          {/* Recent movements */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold c-text sec-title">Recent Movements</h3>
              <button
                type="button"
                className="text-[11px] c-gold font-semibold"
                onClick={() => open("movements", null)}
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {recentMoves.map((move, i) => (
                <MovementRow key={`${move.item}-${i}`} move={move} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <InventoryFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveItem}
      />
      <InventoryViewModal
        item={modal === "view" ? target : null}
        onClose={close}
        onTransfer={() => setModal("transfer")}
        onAdjust={() => setModal("adjust")}
        onEdit={() => setModal("form")}
      />
      <InventoryAdjustModal
        key={`adjust-${target?.id ?? "none"}`}
        item={modal === "adjust" ? target : null}
        onClose={close}
        onConfirm={page.adjustStock}
      />
      <InventoryTransferModal
        key={`transfer-${target?.id ?? "none"}`}
        item={modal === "transfer" ? target : null}
        onClose={close}
        onConfirm={page.transferStock}
      />
      <InventoryImportModal
        open={modal === "import"}
        onClose={close}
        onConfirm={page.importInventory}
      />
      <InventoryMovementsModal
        open={modal === "movements"}
        moves={moves}
        onClose={close}
        onExport={page.exportInventory}
      />
      <InventoryDeleteModal
        item={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteItem}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Inventory;
