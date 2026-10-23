import { useState } from "react";
import {
  AlertOctagon,
  CalendarClock,
  CircleCheckBig,
  ClipboardList,
  Download,
  Dumbbell,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import type { Equipment as EquipmentAsset } from "../../types/equipment";
import {
  EQ_CATS,
  EQ_STATUSES,
  EQ_STATUS_BADGE,
} from "../../utils/json/equipmentData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import { EQ_CAT_ICON, EQ_ICON_FALLBACK } from "./equipmentIcons";
import useEquipment, { condColor } from "./useEquipment";
import EquipmentFormModal from "./modal/equipmentFormModal";
import EquipmentViewModal from "./modal/equipmentViewModal";
import EquipmentMaintenanceModal from "./modal/equipmentMaintenanceModal";
import EquipmentHistoryModal from "./modal/equipmentHistoryModal";
import EquipmentLocationModal from "./modal/equipmentLocationModal";
import EquipmentScheduleModal from "./modal/equipmentScheduleModal";
import EquipmentDeleteModal from "./modal/equipmentDeleteModal";

/*
   Equipment — ported from tailwind/src/equipment.html and assets/js/equipment.js.
   Asset cards / table, condition health bars, filters and the full modal suite.
*/

type ModalKind =
  | "form"
  | "view"
  | "maintenance"
  | "history"
  | "location"
  | "schedule"
  | "delete";

const Equipment = () => {
  const page = useEquipment();
  const {
    equipment,
    filtered,
    schedule,
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

  const menuFor = (e: EquipmentAsset, triggerClassName: string) => (
    <RowMenu
      triggerClassName={triggerClassName}
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", e.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", e.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Equipment
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => open("maintenance", e.id)}
      >
        <Wrench className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Log Maintenance
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("history", e.id)}>
        <ClipboardList className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Service History
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("location", e.id)}>
        <MapPin className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Location
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", e.id)}>
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
          <h2 className="text-xl font-black c-text">Equipment</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track machines, maintenance &amp; service schedules · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportEquipment}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setModal("schedule")}
          >
            <CalendarClock className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Schedule
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-inventory reveal">
          <div className="icon-box ic-gold">
            <Dumbbell className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Assets</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-green">
            <CircleCheckBig className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.operational}</div>
            <div className="text-xs font-medium mt-1 c-dim">Operational</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-orange">
            <Wrench className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.maintenance}</div>
            <div className="text-xs font-medium mt-1 c-dim">In Maintenance</div>
          </div>
        </div>
        <div className="sc-inventory reveal">
          <div className="icon-box ic-red">
            <AlertOctagon className="w-[18px] h-[18px] c-red shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.service}</div>
            <div className="text-xs font-medium mt-1 c-dim">Service Due</div>
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
            placeholder="Search equipment or asset ID…"
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
          {EQ_CATS.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          className="fp-input py-2 text-sm w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          {EQ_STATUSES.map((value) => (
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
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5${view !== "grid" || filtered.length === 0 ? " hidden" : ""}`}
      >
        {filtered.map((e, index) => {
          const Icon = EQ_CAT_ICON[e.category] ?? EQ_ICON_FALLBACK;
          const color = condColor(e.condition);
          return (
            <div
              key={e.id}
              className="eq-card reveal"
              style={{ animationDelay: `${Math.min(index * 35, 400)}ms` }}
            >
              <div className="eq-media">
                <span className={`badge ${EQ_STATUS_BADGE[e.status]} status-pill`}>
                  <span className="dot" />
                  {e.status}
                </span>
                {menuFor(e, "eq-menu-btn")}
                <div className="eq-ic">
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
                    {e.category}
                  </span>
                  <span className="text-[10px] c-dim2 font-mono">{e.asset}</span>
                </div>
                <div className="text-sm font-bold c-text mb-1 truncate">{e.name}</div>
                <div className="text-[11px] c-dim mb-3">
                  Qty: {e.qty} units · {e.location}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] c-dim2 font-bold uppercase tracking-wider">
                    Condition
                  </span>
                  <span className="text-[11px] font-black" style={{ color }}>
                    {e.condition}%
                  </span>
                </div>
                <div className="health-track mb-3">
                  <div
                    className="health-fill"
                    style={{ width: `${e.condition}%`, background: color }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] c-dim mb-3">
                  <CalendarClock
                    className="w-[12px] h-[12px] c-gold shrink-0"
                    aria-hidden="true"
                  />
                  Next service: {e.nextService}
                </div>
                <div className="flex items-center gap-2 pt-3 bd-t">
                  <button
                    type="button"
                    className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => open("history", e.id)}
                  >
                    <ClipboardList
                      className="w-[12px] h-[12px] shrink-0"
                      aria-hidden="true"
                    />
                    History
                  </button>
                  <button
                    type="button"
                    className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => open("maintenance", e.id)}
                  >
                    <Wrench className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    Service
                  </button>
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
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Asset ID</th>
                <th>Condition</th>
                <th>Last Service</th>
                <th>Next Service</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const Icon = EQ_CAT_ICON[e.category] ?? EQ_ICON_FALLBACK;
                const color = condColor(e.condition);
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="eq-rowic">
                          <Icon
                            className="w-[16px] h-[16px] c-gold shrink-0"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <div className="font-semibold c-text">{e.name}</div>
                          <div className="text-[11px] c-dim">
                            Qty: {e.qty} · {e.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{e.category}</td>
                    <td className="font-mono text-xs c-dim">{e.asset}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="health-track" style={{ width: "70px" }}>
                          <div
                            className="health-fill"
                            style={{ width: `${e.condition}%`, background: color }}
                          />
                        </div>
                        <span className="text-[11px] font-bold" style={{ color }}>
                          {e.condition}%
                        </span>
                      </div>
                    </td>
                    <td className="c-dim">{e.lastService}</td>
                    <td className="c-dim">{e.nextService}</td>
                    <td>
                      <span className={`badge ${EQ_STATUS_BADGE[e.status]}`}>
                        <span className="dot" />
                        {e.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Maintenance"
                          onClick={() => open("maintenance", e.id)}
                        >
                          <Wrench className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn view"
                          title="View"
                          onClick={() => open("view", e.id)}
                        >
                          <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        {menuFor(e, "eq-rowmenu")}
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
        <div className="text-[42px] opacity-30 mb-2">🏋️</div>
        <div className="text-sm font-bold c-text">No equipment found</div>
        <div className="text-xs mt-1 c-dim">
          Try a different search, category, or status filter
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 text-xs c-dim2">
        <span>
          Showing <span>{filtered.length}</span> of <span>{equipment.length}</span> assets
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <EquipmentFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveEquipment}
      />
      <EquipmentViewModal
        equipment={modal === "view" ? target : null}
        onClose={close}
        onHistory={() => setModal("history")}
        onService={() => setModal("maintenance")}
        onEdit={() => setModal("form")}
      />
      <EquipmentMaintenanceModal
        key={`maintenance-${target?.id ?? "none"}`}
        equipment={modal === "maintenance" ? target : null}
        onClose={close}
        onConfirm={page.logMaintenance}
      />
      <EquipmentHistoryModal
        equipment={modal === "history" ? target : null}
        onClose={close}
        onLogMaintenance={() => setModal("maintenance")}
      />
      <EquipmentLocationModal
        key={`location-${target?.id ?? "none"}`}
        equipment={modal === "location" ? target : null}
        onClose={close}
        onConfirm={page.assignLocation}
      />
      <EquipmentScheduleModal
        open={modal === "schedule"}
        schedule={schedule}
        onClose={close}
        onService={(id) => open("maintenance", id)}
        onExport={page.exportEquipment}
      />
      <EquipmentDeleteModal
        equipment={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteEquipment}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Equipment;
