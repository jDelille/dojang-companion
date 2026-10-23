import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Award,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  Clock,
  CirclePause,
  DollarSign,
  Download,
  Eye,
  LayoutGrid,
  List,
  LogIn,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type { Branch, BranchSortKey } from "../../types/branches";
import {
  BRANCH_STATUS_BADGE,
  MANAGERS,
  capClass,
  capPct,
  mgrName,
} from "../../utils/json/branchesData";
import { usd } from "../../utils/formatUtils";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import useBranches, { avClass, initials } from "./useBranches";
import BranchFormModal from "./modal/branchFormModal";
import BranchViewModal from "./modal/branchViewModal";
import BranchManagerModal from "./modal/branchManagerModal";
import BranchSettingsModal from "./modal/branchSettingsModal";
import BranchTransferModal from "./modal/branchTransferModal";
import BranchStatusModal from "./modal/branchStatusModal";
import BranchExportModal from "./modal/branchExportModal";
import BranchDeleteModal from "./modal/branchDeleteModal";
import BranchPrintSheet from "./branchPrintSheet";

/*
   Branches — ported from tailwind/src/branches.html and assets/js/branches.js.
   Location cards + list view, capacity bars, filters, sorting and the full
   modal suite: Add / Edit · View · Assign Manager · Branch Settings ·
   Transfer Members · Change Status · Export · Delete, plus print and CSV/JSON
   export of the user's own seed data.
*/

const num = (n: number) => n.toLocaleString("en-US");

const TABS: { tab: "All" | Branch["status"]; label: string; Icon: typeof Clock | null }[] = [
  { tab: "All", label: "All", Icon: null },
  { tab: "Active", label: "Active", Icon: CircleCheckBig },
  { tab: "Opening Soon", label: "Opening Soon", Icon: Clock },
  { tab: "Temporarily Closed", label: "Closed", Icon: CirclePause },
];

type ModalKind =
  | "form"
  | "view"
  | "manager"
  | "settings"
  | "transfer"
  | "status"
  | "export"
  | "delete";

const Stars = ({ rating }: { rating: number }) =>
  rating ? (
    <span className="flex items-center gap-1 text-[12px] font-bold c-gold">
      <Star className="star-ic w-[12px] h-[12px] shrink-0" aria-hidden="true" />
      {rating.toFixed(1)}
    </span>
  ) : (
    <span className="text-[11px] c-dim">Not rated yet</span>
  );

const Branches = () => {
  const page = useBranches();
  const {
    branches,
    filtered,
    cities,
    kpis,
    tabCounts,
    search,
    setSearch,
    tab,
    setTab,
    city,
    setCity,
    sort,
    dir,
    setSortField,
    toggleSort,
    view,
    setView,
    current,
    printTarget,
  } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;
  const hq = branches.find((b) => b.hq) ?? null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Fill the print sheet, then hand off to window.print(). */
  useEffect(() => {
    if (printTarget) page.runPrint(printTarget.ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printTarget]);

  const printBranchList = () => page.printBranches(filtered.map((b) => b.id));

  const printTargetBranches = printTarget
    ? printTarget.ids
        .map((id) => branches.find((b) => b.id === id))
        .filter((b): b is Branch => Boolean(b))
    : [];

  const empty = filtered.length === 0;

  /* Per-record overflow menu — mirrors menuItems() in branches.js. */
  const menuFor = (b: Branch, triggerClassName: string) => (
    <RowMenu
      triggerClassName={triggerClassName}
      triggerTitle="More actions"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", b.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", b.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Branch
      </button>
      <button
        type="button"
        className="dropdown-item"
        disabled={b.id === current}
        onClick={() => page.switchTo(b.id)}
      >
        <LogIn className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Switch to Branch
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item" onClick={() => open("manager", b.id)}>
        <UserCog className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Manager
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("settings", b.id)}>
        <Settings className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Branch Settings
      </button>
      <button
        type="button"
        className="dropdown-item"
        disabled={b.members === 0}
        onClick={() => open("transfer", b.id)}
      >
        <ArrowLeftRight className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Transfer Members
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("status", b.id)}>
        <RefreshCw className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Change Status
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item" onClick={() => page.printBranches([b.id])}>
        <Printer className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Print Details
      </button>
      <button
        type="button"
        className="dropdown-item danger"
        disabled={b.hq}
        onClick={() => open("delete", b.id)}
      >
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {b.hq ? "Delete (HQ locked)" : "Delete Branch"}
      </button>
    </RowMenu>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Branches</h2>
          <p className="text-sm mt-0.5 c-dim">
            Manage all gym locations &amp; performance · Dreams GYM
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={printBranchList}
          >
            <Printer className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("export", null)}
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
            Add Branch
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Building2 className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Branches</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Users className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.members}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Members</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <DollarSign className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.revenue}</div>
            <div className="text-xs font-medium mt-1 c-dim">Monthly Revenue</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Award className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.top}</div>
            <div className="text-xs font-medium mt-1 c-dim">Top Performer</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter branches by status"
        >
          {TABS.map(({ tab: value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={tab === value ? "ord-tab active" : "ord-tab"}
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
            >
              {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
              {label}
              <span className="tab-count">{tabCounts[value]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <div className="relative min-w-[190px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 pr-9 py-2 text-sm"
              placeholder="Search branch, city or manager…"
              aria-label="Search branches"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className={`icon-btn absolute right-2 top-1/2 -translate-y-1/2${
                search ? "" : " hidden"
              }`}
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            </button>
          </div>
          <select
            className="fp-input py-2 text-sm w-auto"
            aria-label="Filter by city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="All">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="fp-input py-2 text-sm w-auto"
            aria-label="Sort branches"
            value={sort}
            onChange={(e) => setSortField(e.target.value as BranchSortKey)}
          >
            <option value="name">Name</option>
            <option value="members">Members</option>
            <option value="revenue">Revenue</option>
            <option value="capacity">Capacity used</option>
            <option value="rating">Rating</option>
          </select>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className={view === "grid" ? "view-btn active" : "view-btn"}
              title="Grid view"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={view === "list" ? "view-btn active" : "view-btn"}
              title="List view"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Branch grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5${
          view !== "grid" || empty ? " hidden" : ""
        }`}
      >
        {filtered.map((b) => {
          const pct = capPct(b);
          const cls = capClass(pct);
          return (
            <div
              key={b.id}
              className={`br-card reveal${b.id === current ? " is-current" : ""}`}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest("button")) open("view", b.id);
              }}
            >
              <div className="br-map">
                {b.hq && <span className="hq-tag">Headquarters</span>}
                {b.id === current && (
                  <span className="cur-tag">
                    <Check className="w-[9px] h-[9px] shrink-0" aria-hidden="true" />
                    Current
                  </span>
                )}
                {menuFor(b, "br-menu-btn")}
                <MapPin className="br-pin w-[26px] h-[26px] shrink-0" aria-hidden="true" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="text-sm font-bold c-text truncate">{b.name}</div>
                    <div className="text-[11px] c-dim flex items-center gap-1 mt-0.5">
                      <MapPin className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                      {b.city}
                    </div>
                  </div>
                  <span className={`badge ${BRANCH_STATUS_BADGE[b.status]}`}>
                    <span className="dot" />
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 mb-3">
                  <Stars rating={b.rating} />
                  <span className="text-[11px] c-dim flex items-center gap-1 min-w-0">
                    <User className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                    <span className="truncate">{mgrName(b)}</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-3 bd-t bd-b mb-3">
                  <div className="br-stat">
                    <div className="v">{b.members ? num(b.members) : "—"}</div>
                    <div className="l">Members</div>
                  </div>
                  <div className="br-stat">
                    <div className="v">{b.staff}</div>
                    <div className="l">Staff</div>
                  </div>
                  <div className="br-stat">
                    <div className="v">{b.revenue ? usd(b.revenue) : "—"}</div>
                    <div className="l">Revenue</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] c-dim2 font-bold uppercase tracking-wider">
                    Capacity
                  </span>
                  <span className={`text-[11px] font-bold cap-val ${cls}`}>{pct}%</span>
                </div>
                <div className="cap-track mb-3">
                  <div className={`cap-fill ${cls}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => open("view", b.id)}
                  >
                    <Eye className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    Details
                  </button>
                  {b.id === current ? (
                    <button
                      type="button"
                      className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                      disabled
                    >
                      <Check className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      Current
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                      onClick={() => page.switchTo(b.id)}
                    >
                      <LogIn className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      Switch
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Branch list */}
      <div className={`glass-card overflow-hidden${view !== "list" || empty ? " hidden" : ""}`}>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[880px]">
            <thead>
              <tr>
                <th
                  className={sort === "name" ? "th-sort sorted" : "th-sort"}
                  aria-sort={
                    sort === "name" ? (dir === "asc" ? "ascending" : "descending") : "none"
                  }
                  onClick={() => toggleSort("name")}
                >
                  Branch
                  {sort === "name" && dir === "desc" ? (
                    <ChevronUp className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  )}
                </th>
                <th>Manager</th>
                <th
                  className={sort === "members" ? "th-sort sorted" : "th-sort"}
                  aria-sort={
                    sort === "members" ? (dir === "asc" ? "ascending" : "descending") : "none"
                  }
                  onClick={() => toggleSort("members")}
                >
                  Members
                  {sort === "members" && dir === "desc" ? (
                    <ChevronUp className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  )}
                </th>
                <th>Staff</th>
                <th
                  className={sort === "capacity" ? "th-sort sorted" : "th-sort"}
                  aria-sort={
                    sort === "capacity" ? (dir === "asc" ? "ascending" : "descending") : "none"
                  }
                  onClick={() => toggleSort("capacity")}
                >
                  Capacity
                  {sort === "capacity" && dir === "desc" ? (
                    <ChevronUp className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  )}
                </th>
                <th
                  className={sort === "revenue" ? "th-sort sorted" : "th-sort"}
                  aria-sort={
                    sort === "revenue" ? (dir === "asc" ? "ascending" : "descending") : "none"
                  }
                  onClick={() => toggleSort("revenue")}
                >
                  Revenue
                  {sort === "revenue" && dir === "desc" ? (
                    <ChevronUp className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  )}
                </th>
                <th
                  className={sort === "rating" ? "th-sort sorted" : "th-sort"}
                  aria-sort={
                    sort === "rating" ? (dir === "asc" ? "ascending" : "descending") : "none"
                  }
                  onClick={() => toggleSort("rating")}
                >
                  Rating
                  {sort === "rating" && dir === "desc" ? (
                    <ChevronUp className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="sort-ic w-[12px] h-[12px] inline shrink-0" aria-hidden="true" />
                  )}
                </th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const pct = capPct(b);
                const cls = capClass(pct);
                const m = MANAGERS.find((x) => x.id === b.managerId) ?? null;
                return (
                  <tr
                    key={b.id}
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest("button")) open("view", b.id);
                    }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="br-rowic">
                          <Building2
                            className="w-[15px] h-[15px] c-gold shrink-0"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold c-text truncate">
                            {b.name}
                            {b.hq && <span className="badge badge-active"> HQ</span>}
                            {b.id === current && (
                              <span className="badge badge-present"> Current</span>
                            )}
                          </div>
                          <div className="text-[11px] c-dim truncate">{b.city}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {m ? (
                        <div className="flex items-center gap-2.5">
                          <div className={`br-avatar ${avClass(m.name)}`}>{initials(m.name)}</div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold c-text truncate">
                              {m.name}
                            </div>
                            <div className="text-[11px] c-dim">{m.role}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="c-dim2">Unassigned</span>
                      )}
                    </td>
                    <td>{b.members ? num(b.members) : <span className="c-dim2">—</span>}</td>
                    <td className="c-dim">{b.staff}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="cap-track cap-track-sm">
                          <div className={`cap-fill ${cls}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-[11px] font-bold cap-val ${cls}`}>{pct}%</span>
                      </div>
                    </td>
                    <td>{b.revenue ? usd(b.revenue) : <span className="c-dim2">—</span>}</td>
                    <td>
                      {b.rating ? (
                        <span className="c-gold font-semibold">{b.rating.toFixed(1)}</span>
                      ) : (
                        <span className="c-dim2">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${BRANCH_STATUS_BADGE[b.status]}`}>
                        <span className="dot" />
                        {b.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="icon-btn view"
                          title="View details"
                          aria-label={"View " + b.name}
                          onClick={() => open("view", b.id)}
                        >
                          <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Branch settings"
                          aria-label={"Settings for " + b.name}
                          onClick={() => open("settings", b.id)}
                        >
                          <Settings className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        {menuFor(b, "br-rowmenu")}
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
      <div className={`text-center py-16${empty ? "" : " hidden"}`}>
        <div className="text-[42px] opacity-30 mb-2">🏢</div>
        <div className="text-sm font-bold c-text">No branches found</div>
        <div className="text-xs mt-1 c-dim">Try a different tab, city or search term</div>
        <button
          type="button"
          className="btn-ghost mt-4 px-4 py-2 text-xs"
          onClick={page.resetFilters}
        >
          Reset filters
        </button>
      </div>

      <div className={`flex items-center justify-between mt-5 text-xs c-dim2${empty ? " hidden" : ""}`}>
        <span>
          Showing <span>{filtered.length}</span> of <span>{branches.length}</span> branches
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <BranchFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        branches={branches}
        onClose={close}
        onSubmit={page.saveBranch}
      />
      <BranchViewModal
        branch={modal === "view" ? target : null}
        onClose={close}
        onManager={() => setModal("manager")}
        onTransfer={() => setModal("transfer")}
        onPrint={() => {
          const id = targetId;
          close();
          if (id != null) page.printBranches([id]);
        }}
        onEdit={() => setModal("form")}
        onSettings={() => setModal("settings")}
      />
      <BranchManagerModal
        key={`manager-${target?.id ?? "none"}`}
        branch={modal === "manager" ? target : null}
        branches={branches}
        onClose={close}
        onConfirm={page.assignManager}
      />
      <BranchSettingsModal
        key={`settings-${target?.id ?? "none"}`}
        branch={modal === "settings" ? target : null}
        onClose={close}
        onConfirm={page.saveSettings}
      />
      <BranchTransferModal
        key={`transfer-${target?.id ?? "none"}`}
        branch={modal === "transfer" ? target : null}
        branches={branches}
        onClose={close}
        onConfirm={page.transferMembers}
      />
      <BranchStatusModal
        key={`status-${target?.id ?? "none"}`}
        branch={modal === "status" ? target : null}
        onClose={close}
        onConfirm={page.changeStatus}
      />
      <BranchExportModal
        open={modal === "export"}
        filteredCount={filtered.length}
        totalCount={branches.length}
        onClose={close}
        onConfirm={page.exportBranches}
      />
      <BranchDeleteModal
        key={`delete-${target?.id ?? "none"}`}
        branch={modal === "delete" ? target : null}
        hqName={hq ? hq.name : null}
        onClose={close}
        onConfirm={page.deleteBranch}
      />

      <BranchPrintSheet branches={printTargetBranches} />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Branches;
