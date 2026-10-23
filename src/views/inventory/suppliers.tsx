import { useState } from "react";
import {
  BadgeCheck,
  DollarSign,
  Download,
  Eye,
  FilePlus,
  FileText,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import type { Supplier } from "../../types/suppliers";
import {
  SUPPLIER_CATS,
  SUPPLIER_STATUSES,
  SUPPLIER_STATUS_BADGE,
} from "../../utils/json/suppliersData";
import { initials, usd } from "../../utils/formatUtils";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import SupplierStars from "./supplierStars";
import useSuppliers from "./useSuppliers";
import SupplierFormModal from "./modal/supplierFormModal";
import SupplierViewModal from "./modal/supplierViewModal";
import SupplierPoModal from "./modal/supplierPoModal";
import SupplierPaymentModal from "./modal/supplierPaymentModal";
import SupplierContactModal from "./modal/supplierContactModal";
import SupplierDeleteModal from "./modal/supplierDeleteModal";

/*
   Suppliers — ported from tailwind/src/suppliers.html and assets/js/suppliers.js.
   Vendor cards / table, ratings, filters and the full modal suite.
*/

type ModalKind = "form" | "view" | "po" | "payment" | "contact" | "delete";

const Suppliers = () => {
  const page = useSuppliers();
  const {
    suppliers,
    filtered,
    kpis,
    view,
    setView,
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

  const menuFor = (s: Supplier) => (
    <RowMenu
      triggerClassName="sup-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", s.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", s.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Supplier
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("po", s.id)}>
        <FilePlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        New Purchase Order
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("payment", s.id)}>
        <DollarSign className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Record Payment
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("contact", s.id)}>
        <Send className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Contact
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", s.id)}>
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
          <h2 className="text-xl font-black c-text">Suppliers</h2>
          <p className="text-sm mt-0.5 c-dim">
            Manage vendors, purchase orders &amp; spend · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportSuppliers}
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
            Add Supplier
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-inventory reveal">
          <div className="icon-box ic-gold">
            <Truck className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Suppliers</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-green">
            <BadgeCheck className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.active}</div>
            <div className="text-xs font-medium mt-1 c-dim">Active</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-purple">
            <FileText className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.pos}</div>
            <div className="text-xs font-medium mt-1 c-dim">Open POs</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-cyan">
            <DollarSign className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.spend}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Spend (YTD)</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search supplier, contact or category…"
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
          {SUPPLIER_CATS.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          className="fp-input py-2 text-sm w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          {SUPPLIER_STATUSES.map((value) => (
            <option key={value}>{value}</option>
          ))}
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

      {/* Grid view */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5${view !== "grid" || filtered.length === 0 ? " hidden" : ""}`}
      >
        {filtered.map((s, index) => (
          <div
            key={s.id}
            className="sup-card reveal"
            style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="sup-logo">{initials(s.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold c-text truncate">{s.name}</div>
                </div>
                <div className="text-[11px] c-gold font-semibold uppercase tracking-wider mt-0.5">
                  {s.category}
                </div>
                <div className="mt-1.5">
                  <SupplierStars rating={s.rating} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`badge ${SUPPLIER_STATUS_BADGE[s.status]}`}>
                  <span className="dot" />
                  {s.status}
                </span>
                {menuFor(s)}
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="contact-line">
                <User aria-hidden="true" />
                {s.contact}
              </div>
              <div className="contact-line">
                <Mail aria-hidden="true" />
                <span className="truncate">{s.email}</span>
              </div>
              <div className="contact-line">
                <Phone aria-hidden="true" />
                {s.phone}
              </div>
              <div className="contact-line">
                <MapPin aria-hidden="true" />
                {s.city}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 py-3 bd-t bd-b mb-3">
              <div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider">
                  Open POs
                </div>
                <div className="text-base font-black c-text mt-0.5">{s.openPOs}</div>
              </div>
              <div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider">
                  Spend YTD
                </div>
                <div className="text-base font-black gt mt-0.5">{usd(s.spend)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                onClick={() => open("view", s.id)}
              >
                <Eye className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                View
              </button>
              <button
                type="button"
                className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                onClick={() => open("po", s.id)}
              >
                <FilePlus className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                New PO
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* List view */}
      <div
        className={`glass-card overflow-hidden${view !== "list" || filtered.length === 0 ? " hidden" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="data-table min-w-[880px]">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Open POs</th>
                <th>Spend (YTD)</th>
                <th>Rating</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="sup-avatar">{initials(s.name)}</div>
                      <div>
                        <div className="font-semibold c-text">{s.name}</div>
                        <div className="text-[11px] c-dim">{s.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.category}</td>
                  <td>
                    <div className="c-text2">{s.contact}</div>
                    <div className="text-[11px] c-dim">{s.phone}</div>
                  </td>
                  <td className="font-bold c-text">{s.openPOs}</td>
                  <td className="font-bold c-text">{usd(s.spend)}</td>
                  <td>
                    <SupplierStars rating={s.rating} />
                  </td>
                  <td>
                    <span className={`badge ${SUPPLIER_STATUS_BADGE[s.status]}`}>
                      <span className="dot" />
                      {s.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="icon-btn view"
                        title="View"
                        onClick={() => open("view", s.id)}
                      >
                        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="New PO"
                        onClick={() => open("po", s.id)}
                      >
                        <FilePlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                      </button>
                      {menuFor(s)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      <div className={`text-center py-16${filtered.length === 0 ? "" : " hidden"}`}>
        <div className="text-[42px] opacity-30 mb-2">🚚</div>
        <div className="text-sm font-bold c-text">No suppliers found</div>
        <div className="text-xs mt-1 c-dim">
          Try a different search, category, or status filter
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 text-xs c-dim2">
        <span>
          Showing <span>{filtered.length}</span> of <span>{suppliers.length}</span> suppliers
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <SupplierFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveSupplier}
      />
      <SupplierViewModal
        supplier={modal === "view" ? target : null}
        onClose={close}
        onContact={() => setModal("contact")}
        onPay={() => setModal("payment")}
        onPO={() => setModal("po")}
      />
      <SupplierPoModal
        key={`po-${target?.id ?? "none"}`}
        supplier={modal === "po" ? target : null}
        poSeq={page.poSeq}
        onClose={close}
        onConfirm={page.createPO}
      />
      <SupplierPaymentModal
        key={`payment-${target?.id ?? "none"}`}
        supplier={modal === "payment" ? target : null}
        onClose={close}
        onConfirm={page.recordPayment}
      />
      <SupplierContactModal
        key={`contact-${target?.id ?? "none"}`}
        supplier={modal === "contact" ? target : null}
        onClose={close}
        onConfirm={page.contactSupplier}
      />
      <SupplierDeleteModal
        supplier={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteSupplier}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Suppliers;
