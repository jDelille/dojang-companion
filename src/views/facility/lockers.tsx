import { useState } from "react";
import {
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Crown,
  Download,
  Eye,
  LayoutGrid,
  List,
  LockOpen,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  User,
  UserPlus,
  Wrench,
  X,
} from "lucide-react";
import type { Locker, SortKey } from "../../types/lockers";
import { STATE_BADGE, STATE_CLASS } from "../../utils/json/lockersData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import { LOCKER_ICON, LOCKER_ICON_FALLBACK } from "./lockersIcons";
import useLockers, { code, fmtDate, initials, isOverdue } from "./useLockers";
import LockerFormModal from "./modal/lockerFormModal";
import LockerViewModal from "./modal/lockerViewModal";
import LockerAssignModal from "./modal/lockerAssignModal";
import LockerReleaseModal from "./modal/lockerReleaseModal";
import LockerMaintenanceModal from "./modal/lockerMaintenanceModal";
import LockerHistoryModal from "./modal/lockerHistoryModal";
import LockerStatusModal from "./modal/lockerStatusModal";
import LockerExportModal from "./modal/lockerExportModal";
import LockerQrModal from "./modal/lockerQrModal";
import LockerDeleteModal from "./modal/lockerDeleteModal";

/*
   Locker Management — ported from tailwind/src/lockers.html and
   assets/js/lockers.js. Visual locker map + list view, status/zone/size/search
   filters, sorting, pagination, multi-select bulk actions and the full modal
   suite: Add / Edit · View · Assign · Release · Maintenance · History ·
   Change Status · Export · QR · Delete.
*/

const STATUS_TABS = ["All", "Available", "Occupied", "Reserved", "Maintenance"];
const ZONE_TABS: { zone: string; label: string; Icon: typeof User }[] = [
  { zone: "All", label: "All Zones", Icon: LayoutGrid },
  { zone: "Men's", label: "Men's", Icon: User },
  { zone: "Women's", label: "Women's", Icon: User },
  { zone: "Premium", label: "Premium", Icon: Crown },
];
/** Single-purpose modal kinds keyed by the ids they act on. */
type ModalKind =
  | "form"
  | "view"
  | "assign"
  | "release"
  | "maintenance"
  | "history"
  | "status"
  | "export"
  | "qr"
  | "delete"
  | null;

const Lockers = () => {
  const page = useLockers();
  const {
    lockers,
    filtered,
    pageRows,
    pageInfo,
    kpis,
    tabCounts,
    status,
    zone,
    search,
    size,
    sort,
    dir,
    view,
    selectMode,
    selected,
  } = page;

  const [modal, setModal] = useState<ModalKind>(null);
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [editTarget, setEditTarget] = useState<Locker | null>(null);
  const [assignForce, setAssignForce] = useState(false);

  const targets = targetIds.map((id) => page.find(id)).filter((l): l is Locker => !!l);
  const single = targets[0] ?? null;

  const close = () => {
    setModal(null);
    setAssignForce(false);
  };

  const openForm = (id: number | null) => {
    setEditTarget(id != null ? page.find(id) : null);
    setModal("form");
  };
  const openView = (id: number) => {
    setTargetIds([id]);
    setModal("view");
  };
  const openAssign = (ids: number[], force = false) => {
    const list = ids
      .map((id) => page.find(id))
      .filter((l): l is Locker => !!l && (force || l.status === "Available"));
    if (!list.length) {
      page.showToast("Select at least one available locker");
      return;
    }
    setTargetIds(list.map((l) => l.id));
    setAssignForce(force);
    setModal("assign");
  };
  const openRelease = (ids: number[]) => {
    const list = ids
      .map((id) => page.find(id))
      .filter((l): l is Locker => !!l && (l.status === "Occupied" || l.status === "Reserved"));
    if (!list.length) {
      page.showToast("Select at least one assigned locker");
      return;
    }
    setTargetIds(list.map((l) => l.id));
    setModal("release");
  };
  const openMaintenance = (ids: number[]) => {
    if (!ids.length) return;
    setTargetIds(ids);
    setModal("maintenance");
  };
  const openHistory = (id: number) => {
    setTargetIds([id]);
    setModal("history");
  };
  const openStatus = (ids: number[]) => {
    if (!ids.length) return;
    setTargetIds(ids);
    setModal("status");
  };
  const openExport = (ids: number[]) => {
    setTargetIds(ids);
    setModal("export");
  };
  const openQr = (id: number) => {
    setTargetIds([id]);
    setModal("qr");
  };
  const openDelete = (ids: number[]) => {
    if (!ids.length) return;
    setTargetIds(ids);
    setModal("delete");
  };

  const sel = () => (selected.size ? Array.from(selected) : []);

  const skippedCount = assignForce ? 0 : targetIds.length - targets.filter((l) => l.status === "Available").length;

  const menuFor = (l: Locker) => {
    const busy = l.status === "Occupied" || l.status === "Reserved";
    return (
      <RowMenu
        triggerClassName="lk-rowmenu"
        triggerTitle="More"
        trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
      >
        <button type="button" className="dropdown-item" onClick={() => openView(l.id)}>
          <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          View Details
        </button>
        <button type="button" className="dropdown-item" onClick={() => openForm(l.id)}>
          <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Edit Locker
        </button>
        <button
          type="button"
          className="dropdown-item"
          disabled={l.status !== "Available"}
          onClick={() => openAssign([l.id])}
        >
          <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Assign Locker
        </button>
        <button
          type="button"
          className="dropdown-item"
          disabled={!busy}
          onClick={() => openRelease([l.id])}
        >
          <LockOpen className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Release Locker
        </button>
        <button type="button" className="dropdown-item" onClick={() => openStatus([l.id])}>
          <RefreshCw className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Change Status
        </button>
        <div className="menu-sep" />
        <button type="button" className="dropdown-item" onClick={() => openMaintenance([l.id])}>
          <Wrench className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Log Maintenance
        </button>
        <button type="button" className="dropdown-item" onClick={() => openHistory(l.id)}>
          <ClipboardList className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Maintenance History
        </button>
        <div className="menu-sep" />
        <button type="button" className="dropdown-item" onClick={() => openQr(l.id)}>
          <QrCode className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          QR Tag
        </button>
        <button type="button" className="dropdown-item" onClick={() => page.printLockers([l])}>
          <Printer className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Print Details
        </button>
        <div className="menu-sep" />
        <button type="button" className="dropdown-item danger" onClick={() => openDelete([l.id])}>
          <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Delete Locker
        </button>
      </RowMenu>
    );
  };

  const empty = filtered.length === 0;
  const pageRowIds = pageRows.map((l) => l.id);
  const allChecked = pageRowIds.length > 0 && pageRowIds.every((id) => selected.has(id));

  /* Windowed page numbers with ellipses. */
  const pageNums: (number | "…")[] = [];
  for (let p = 1; p <= pageInfo.pages; p++) {
    if (p === 1 || p === pageInfo.pages || Math.abs(p - page.page) <= 1) pageNums.push(p);
    else if (pageNums[pageNums.length - 1] !== "…") pageNums.push("…");
  }

  const sortTh = (key: SortKey, label: string) => {
    const on = sort === key;
    const SortIc = on && dir === "desc" ? ChevronUp : ChevronDown;
    return (
      <th
        className={`th-sort${on ? " sorted" : ""}`}
        aria-sort={on ? (dir === "asc" ? "ascending" : "descending") : "none"}
        onClick={() => page.toggleSort(key)}
      >
        {label}
        <SortIc className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
      </th>
    );
  };

  const existingNums = lockers.map((l) => Number(l.num));
  const nextFreeNum = (() => {
    const used = new Set(lockers.map((l) => l.id));
    let n = 1;
    while (used.has(n)) n++;
    return n;
  })();

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Locker Management</h2>
          <p className="text-sm mt-0.5 c-dim">
            Assign, track &amp; maintain member lockers · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => page.printLockers(filtered)}
          >
            <Printer className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => openExport([])}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => openForm(null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Lockers
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <LockOpen className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Lockers</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <LockOpen className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.available}</div>
            <div className="text-xs font-medium mt-1 c-dim">Available</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Wrench className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.occupancy}</div>
            <div className="text-xs font-medium mt-1 c-dim">Occupancy</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Wrench className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.maintenance}</div>
            <div className="text-xs font-medium mt-1 c-dim">Maintenance</div>
          </div>
        </div>
      </div>

      {/* Status tabs + legend */}
      <div className="glass-card p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 overflow-x-auto"
          role="tablist"
          aria-label="Filter lockers by status"
        >
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={status === t ? "ord-tab active" : "ord-tab"}
              role="tab"
              aria-selected={status === t}
              onClick={() => page.setStatus(t)}
            >
              {t}
              <span className="tab-count">{tabCounts[t] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center flex-wrap gap-4 text-[11px] c-dim">
          <span className="flex items-center gap-1.5">
            <span className="legend-dot lg-available" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="legend-dot lg-occupied" />
            Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="legend-dot lg-reserved" />
            Reserved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="legend-dot lg-maintenance" />
            Maintenance
          </span>
        </div>
      </div>

      {/* Toolbar: search + filters + view */}
      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0" aria-hidden="true" />
          <input
            type="text"
            className="fp-input pl-9 pr-9 py-2 text-sm"
            placeholder="Search locker no. or member…"
            aria-label="Search lockers"
            value={search}
            onChange={(e) => page.changeSearch(e.target.value)}
          />
          <button
            type="button"
            className={`icon-btn absolute right-2 top-1/2 -translate-y-1/2${search ? "" : " hidden"}`}
            aria-label="Clear search"
            onClick={() => page.changeSearch("")}
          >
            <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <select
          className="fp-input py-2 text-sm w-auto"
          aria-label="Filter by locker size"
          value={size}
          onChange={(e) => page.changeSize(e.target.value)}
        >
          <option value="All">All Sizes</option>
          <option>Small</option>
          <option>Medium</option>
          <option>Large</option>
          <option>XL</option>
        </select>
        <select
          className="fp-input py-2 text-sm w-auto"
          aria-label="Sort lockers"
          value={sort}
          onChange={(e) => page.changeSort(e.target.value as SortKey)}
        >
          <option value="num">Locker No.</option>
          <option value="status">Status</option>
          <option value="zone">Zone</option>
          <option value="member">Member</option>
          <option value="expiry">Expiry Date</option>
        </select>
        <button
          type="button"
          className={`${selectMode ? "btn-gold" : "btn-ghost"} flex items-center gap-2 px-3 py-2 text-sm`}
          aria-pressed={selectMode}
          onClick={page.toggleSelectMode}
        >
          <CheckSquare className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
          Select
        </button>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={view === "map" ? "view-btn active" : "view-btn"}
            title="Map view"
            aria-label="Map view"
            aria-pressed={view === "map"}
            onClick={() => page.setView("map")}
          >
            <LayoutGrid className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={view === "list" ? "view-btn active" : "view-btn"}
            title="List view"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => page.setView("list")}
          >
            <List className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Zones */}
      <div
        className="flex items-center gap-2 mb-4 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filter lockers by zone"
      >
        {ZONE_TABS.map(({ zone: z, label, Icon }) => (
          <button
            key={z}
            type="button"
            className={zone === z ? "ord-tab active" : "ord-tab"}
            role="tab"
            aria-selected={zone === z}
            onClick={() => page.setZone(z)}
          >
            <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      <div className={`bulk-bar${selected.size === 0 ? " hidden" : ""}`}>
        <span className="bulk-count">
          <CheckCircle2 className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
          <span>{selected.size}</span> selected
        </span>
        <span className="bulk-sep" />
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
          onClick={() => openAssign(sel())}
        >
          <UserPlus className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Assign
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
          onClick={() => openRelease(sel())}
        >
          <LockOpen className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Release
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
          onClick={() => openStatus(sel())}
        >
          <RefreshCw className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Change Status
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
          onClick={() => openMaintenance(sel())}
        >
          <Wrench className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Maintenance
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
          onClick={() => openExport(sel())}
        >
          <Download className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Export
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
          onClick={() => page.printLockers(sel().map((id) => page.find(id)).filter((l): l is Locker => !!l))}
        >
          <Printer className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Print
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs danger-link"
          onClick={() => openDelete(sel())}
        >
          <Trash2 className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Delete
        </button>
        <span className="bulk-sep" />
        <button
          type="button"
          className="btn-ghost px-2.5 py-1.5 text-xs"
          onClick={() => {
            page.clearSelection();
          }}
        >
          Clear
        </button>
      </div>

      {/* Map view */}
      <div className={`glass-card p-5${view !== "map" || empty ? " hidden" : ""}`}>
        <div className="locker-grid">
          {pageRows.map((l) => {
            const Icon = LOCKER_ICON[l.status] ?? LOCKER_ICON_FALLBACK;
            const isSel = selected.has(l.id);
            return (
              <div
                key={l.id}
                className={`locker ${STATE_CLASS[l.status]}${isSel ? " sel" : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={
                  "Locker " +
                  l.num +
                  ", " +
                  l.zone +
                  ", " +
                  l.status +
                  (l.member ? ", " + l.member : "")
                }
                title={
                  l.zone + " · " + l.size + " · " + l.status + (l.member ? " · " + l.member : "")
                }
                onClick={(e) => {
                  if (selectMode || e.ctrlKey || e.metaKey) page.toggleSelect(l.id);
                  else openView(l.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (selectMode) page.toggleSelect(l.id);
                    else openView(l.id);
                  }
                }}
              >
                <span className="lk-check">
                  <Check className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                </span>
                {isOverdue(l) && <span className="lk-flag" title="Past expiry" />}
                <span className="hinge" />
                <Icon className="w-[16px] h-[16px] shrink-0" aria-hidden="true" />
                <span className="num">{l.num}</span>
                <span className="st">{l.status.slice(0, 4)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* List view */}
      <div className={`glass-card overflow-hidden${view !== "list" || empty ? " hidden" : ""}`}>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th className="w-[40px]">
                  <input
                    type="checkbox"
                    className="cbx"
                    aria-label="Select all lockers on this page"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) {
                        const on = pageRowIds.filter((id) => selected.has(id)).length;
                        el.indeterminate = on > 0 && on < pageRowIds.length;
                      }
                    }}
                    onChange={(e) => page.toggleSelectAll(e.target.checked, pageRowIds)}
                  />
                </th>
                {sortTh("num", "Locker")}
                {sortTh("zone", "Zone")}
                <th>Size</th>
                {sortTh("member", "Assigned To")}
                <th>Since</th>
                {sortTh("expiry", "Expires")}
                {sortTh("status", "Status")}
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((l) => {
                const Icon = LOCKER_ICON[l.status] ?? LOCKER_ICON_FALLBACK;
                const isSel = selected.has(l.id);
                return (
                  <tr key={l.id} className={isSel ? "sel" : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        className="cbx"
                        aria-label={"Select locker " + l.num}
                        checked={isSel}
                        onChange={() => page.toggleSelect(l.id)}
                      />
                    </td>
                    <td
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button,input,a")) return;
                        openView(l.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="lk-rowic">
                          <Icon className="w-[15px] h-[15px] c-gold shrink-0" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="font-semibold c-text">Locker {l.num}</div>
                          <div className="text-[11px] c-dim font-mono">{code(l)}</div>
                        </div>
                      </div>
                    </td>
                    <td>{l.zone}</td>
                    <td className="c-dim">{l.size}</td>
                    <td>
                      {l.member ? (
                        <div className="flex items-center gap-2.5">
                          <div className="av av-gold">{initials(l.member)}</div>
                          <div>
                            <div className="text-[13px] font-semibold c-text">{l.member}</div>
                            <div className="text-[11px] c-dim font-mono">{l.memberId}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="c-dim2">—</span>
                      )}
                    </td>
                    <td className="c-dim">{fmtDate(l.since)}</td>
                    <td>
                      {l.expiry ? (
                        <span className={isOverdue(l) ? "c-red font-semibold" : "c-dim"}>
                          {fmtDate(l.expiry)}
                        </span>
                      ) : (
                        <span className="c-dim2">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${STATE_BADGE[l.status]}`}>
                        <span className="dot" />
                        {l.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="icon-btn view"
                          title="View details"
                          aria-label={"View locker " + l.num}
                          onClick={() => openView(l.id)}
                        >
                          <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        {l.status === "Available" ? (
                          <button
                            type="button"
                            className="icon-btn"
                            title="Assign"
                            aria-label={"Assign locker " + l.num}
                            onClick={() => openAssign([l.id])}
                          >
                            <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="icon-btn"
                            title="Release"
                            aria-label={"Release locker " + l.num}
                            disabled={l.status === "Maintenance"}
                            onClick={() => openRelease([l.id])}
                          >
                            <LockOpen className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          </button>
                        )}
                        {menuFor(l)}
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
      <div className={`text-center py-14${empty ? "" : " hidden"}`}>
        <div className="text-[38px] opacity-30 mb-2">🔒</div>
        <div className="text-sm font-bold c-text">No lockers match</div>
        <div className="text-xs mt-1 c-dim">Try a different status, zone, size or search term</div>
        <button
          type="button"
          className="btn-ghost mt-4 px-4 py-2 text-xs"
          onClick={page.resetFilters}
        >
          Reset filters
        </button>
      </div>

      {/* Pagination */}
      <div className={`flex flex-wrap items-center justify-between gap-3 mt-5${empty ? " hidden" : ""}`}>
        <div className="flex items-center gap-2 text-xs c-dim2">
          <span>
            Showing <span>{pageInfo.from}</span>–<span>{pageInfo.to}</span> of{" "}
            <span>{pageInfo.total}</span> lockers
          </span>
          <select
            className="fp-input py-1 text-xs w-auto"
            aria-label="Lockers per page"
            value={page.per}
            onChange={(e) => page.changePer(Number(e.target.value))}
          >
            <option value={24}>24 / page</option>
            <option value={48}>48 / page</option>
            <option value={96}>96 / page</option>
          </select>
        </div>
        <nav className="flex items-center gap-1.5" aria-label="Pagination">
          {pageInfo.pages > 1 && (
            <>
              <button
                type="button"
                className="page-btn"
                aria-label="Previous page"
                disabled={page.page === 1}
                onClick={() => page.setPage(page.page - 1)}
              >
                <ChevronLeft className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              </button>
              {pageNums.map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="text-xs c-dim2 px-1">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`page-btn${p === page.page ? " active" : ""}`}
                    aria-current={p === page.page ? "page" : undefined}
                    onClick={() => page.setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                className="page-btn"
                aria-label="Next page"
                disabled={page.page === pageInfo.pages}
                onClick={() => page.setPage(page.page + 1)}
              >
                <ChevronRight className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              </button>
            </>
          )}
        </nav>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <LockerFormModal
        key={`form-${editTarget?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? editTarget : null}
        nextFreeNum={nextFreeNum}
        existingNums={existingNums}
        onClose={close}
        onSubmit={page.saveLocker}
      />
      <LockerViewModal
        locker={modal === "view" ? single : null}
        onClose={close}
        onHistory={() => single && openHistory(single.id)}
        onQr={() => single && openQr(single.id)}
        onPrint={() => {
          if (single) {
            page.printLockers([single]);
            close();
          }
        }}
        onEdit={() => single && openForm(single.id)}
        onAssign={() => single && openAssign([single.id])}
        onRelease={() => single && openRelease([single.id])}
        onMarkFixed={() => {
          if (single) {
            page.markFixed(single.id);
            close();
          }
        }}
      />
      <LockerAssignModal
        key={`assign-${targetIds.join("-") || "none"}`}
        targets={modal === "assign" ? targets : []}
        skipped={skippedCount}
        onClose={close}
        onConfirm={page.assignLockers}
      />
      <LockerReleaseModal
        key={`release-${targetIds.join("-") || "none"}`}
        targets={modal === "release" ? targets : []}
        onClose={close}
        onConfirm={page.releaseLockers}
      />
      <LockerMaintenanceModal
        key={`maint-${targetIds.join("-") || "none"}`}
        targets={modal === "maintenance" ? targets : []}
        onClose={close}
        onConfirm={page.logMaintenance}
      />
      <LockerHistoryModal
        locker={modal === "history" ? single : null}
        onClose={close}
        onLogMaintenance={() => single && openMaintenance([single.id])}
      />
      <LockerStatusModal
        key={`status-${targetIds.join("-") || "none"}`}
        targets={modal === "status" ? targets : []}
        onClose={close}
        onConfirm={page.changeStatus}
        onNeedMember={(ids) => openAssign(ids, true)}
      />
      <LockerExportModal
        open={modal === "export"}
        selectedRows={
          modal === "export"
            ? targetIds.map((id) => page.find(id)).filter((l): l is Locker => !!l)
            : []
        }
        filteredRows={filtered}
        allRows={lockers}
        onClose={close}
        onConfirm={page.exportLockers}
      />
      <LockerQrModal
        locker={modal === "qr" ? single : null}
        onClose={close}
        onDownload={page.qrDownloaded}
        onPrint={() => {
          if (single) {
            page.printLockers([single]);
            close();
          }
        }}
      />
      <LockerDeleteModal
        key={`delete-${targetIds.join("-") || "none"}`}
        targets={modal === "delete" ? targets : []}
        onClose={close}
        onConfirm={page.deleteLockers}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Lockers;
