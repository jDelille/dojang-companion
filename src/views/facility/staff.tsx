import { useState } from "react";
import {
  CalendarCheck,
  Download,
  Eye,
  LayoutGrid,
  Layers,
  List,
  MessageCircle,
  MoreVertical,
  Pencil,
  Phone,
  Plane,
  Search,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { StaffMember } from "../../types/staff";
import {
  PRES,
  SHIFT_COLOR,
  SHIFT_TIME,
  STAFF_STATUS_BADGE,
  avatarFor,
} from "../../utils/json/staffData";
import { all_routes } from "../../routes/all_routes";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import { DEPT_FALLBACK, DEPT_ICON } from "./staffIcons";
import useStaff, { initials } from "./useStaff";
import StaffFormModal from "./modal/staffFormModal";
import StaffViewModal from "./modal/staffViewModal";
import StaffRoleModal from "./modal/staffRoleModal";
import StaffAttendanceModal from "./modal/staffAttendanceModal";
import StaffPayrollModal from "./modal/staffPayrollModal";
import StaffDeleteModal from "./modal/staffDeleteModal";
import Link from "next/link";

/*
   Staff & Roster — ported from tailwind/src/staff.html and assets/js/staff.js.
   Directory (grid/list), department filter, today's roster and the full modal
   suite: Add / Edit · View · Assign Role · Attendance · Payroll · Delete.
*/

const DEPT_TABS = [
  { dept: "All", label: "All Staff" },
  { dept: "Training", label: "Training" },
  { dept: "Reception", label: "Reception" },
  { dept: "Management", label: "Management" },
  { dept: "Housekeeping", label: "Housekeeping" },
  { dept: "Nutrition", label: "Nutrition" },
];

type ModalKind = "form" | "view" | "role" | "attendance" | "payroll" | "delete";

const Staff = () => {
  const page = useStaff();
  const { staff, filtered, roster, kpis, dept, setDept, search, setSearch, view, setView } =
    page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const menuFor = (s: StaffMember) => (
    <RowMenu
      triggerClassName="staff-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", s.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Profile
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", s.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("role", s.id)}>
        <UserCog className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Role
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("attendance", s.id)}>
        <CalendarCheck className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Attendance
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("payroll", s.id)}>
        <Wallet className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Payroll
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", s.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Remove
      </button>
    </RowMenu>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Staff &amp; Roster</h2>
          <p className="text-sm mt-0.5 c-dim">
            Manage your team, shifts &amp; attendance · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportStaff}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <UserPlus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Staff
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Users className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Staff</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <UserCheck className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.present}</div>
            <div className="text-xs font-medium mt-1 c-dim">Present Today</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Plane className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.leave}</div>
            <div className="text-xs font-medium mt-1 c-dim">On Leave</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Layers className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.depts}</div>
            <div className="text-xs font-medium mt-1 c-dim">Departments</div>
          </div>
        </div>
      </div>

      {/* Today's roster */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text sec-title">Today's Roster · Mon, 14 Jul</h3>
          <div className="flex items-center gap-3 text-[11px] c-dim">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm instyle-48" />
              Morning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm instyle-49" />
              Evening
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm instyle-50" />
              Off
            </span>
          </div>
        </div>
        <div className="space-y-2.5">
          {roster.map(({ staff: s, width, offset, label }) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`staff-avatar-sm av ${avatarFor(s.id)}`}>{initials(s.name)}</div>
              <div
                style={{ minWidth: "120px" }}
                className="text-[13px] font-semibold c-text truncate"
              >
                {s.name}
              </div>
              <div
                className="flex-1 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  height: "26px",
                  position: "relative",
                }}
              >
                <div
                  className="shift-bar"
                  style={{
                    width,
                    background: s.shift === "Off" ? "#2E2E34" : SHIFT_COLOR[s.shift],
                    ...(offset ? { marginLeft: "auto" } : {}),
                    ...(s.shift === "Off" ? { color: "#6B7280" } : {}),
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DEPT_TABS.map(({ dept: value, label }) => (
            <button
              key={value}
              type="button"
              className={dept === value ? "ord-tab active" : "ord-tab"}
              onClick={() => setDept(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-[180px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 py-2 text-sm"
              placeholder="Search staff…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
      </div>

      {/* Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5${
          view !== "grid" || filtered.length === 0 ? " hidden" : ""
        }`}
      >
        {filtered.map((s, i) => {
          const DeptIcon = DEPT_ICON[s.dept] ?? DEPT_FALLBACK;
          return (
            <div
              key={s.id}
              className="staff-card reveal"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`staff-av av ${avatarFor(s.id)}`}>
                  {initials(s.name)}
                  <span className="pres-dot" style={{ background: PRES[s.status] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold c-text truncate">{s.name}</div>
                  <div className="text-[11px] c-gold font-semibold">{s.role}</div>
                  <div className="text-[11px] c-dim mt-0.5 flex items-center gap-1">
                    <DeptIcon
                      style={{ width: "11px", height: "11px" }}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {s.dept}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`badge ${STAFF_STATUS_BADGE[s.status]}`}>
                    <span className="dot" />
                    {s.status}
                  </span>
                  {menuFor(s)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 py-3 bd-t bd-b mb-3 text-[11px]">
                <div>
                  <div className="c-dim2 font-bold uppercase tracking-wider text-[9px]">Shift</div>
                  <div className="c-text2 font-semibold mt-0.5">{s.shift}</div>
                </div>
                <div>
                  <div className="c-dim2 font-bold uppercase tracking-wider text-[9px]">
                    Timing
                  </div>
                  <div className="c-text2 font-semibold mt-0.5">{SHIFT_TIME[s.shift]}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${s.phone.replace(/\s/g, "")}`}
                  className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                  Call
                </a>
                <Link
                  href={all_routes.facilityChat}
                  className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                  Message
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div
        className={`glass-card overflow-hidden${
          view !== "list" || filtered.length === 0 ? " hidden" : ""
        }`}
      >
        <div className="overflow-x-auto">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className={`staff-avatar-sm av ${avatarFor(s.id)}`}>
                        {initials(s.name)}
                      </div>
                      <span className="font-semibold c-text">{s.name}</span>
                    </div>
                  </td>
                  <td>{s.role}</td>
                  <td>{s.dept}</td>
                  <td>
                    <span
                      className="text-[12px]"
                      style={{ color: s.shift === "Off" ? "#6B7280" : SHIFT_COLOR[s.shift] }}
                    >
                      {s.shift}
                    </span>{" "}
                    <span className="text-[11px] c-dim">{"· " + SHIFT_TIME[s.shift]}</span>
                  </td>
                  <td className="text-[12px] c-dim">{s.phone}</td>
                  <td>
                    <span className={`badge ${STAFF_STATUS_BADGE[s.status]}`}>
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
                      <Link href={all_routes.facilityChat} className="icon-btn" title="Message">
                        <MessageCircle className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                      </Link>
                      {menuFor(s)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`text-center py-16${filtered.length ? " hidden" : ""}`}>
        <div className="text-[42px] opacity-30 mb-2">👥</div>
        <div className="text-sm font-bold c-text">No staff found</div>
        <div className="text-xs mt-1 c-dim">Try a different department or search</div>
      </div>

      <div className="flex items-center justify-between mt-5 text-xs c-dim2">
        <span>
          Showing <span>{filtered.length}</span> of <span>{staff.length}</span> staff
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <StaffFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveStaff}
      />
      <StaffViewModal
        staff={modal === "view" ? target : null}
        onClose={close}
        onAttendance={() => setModal("attendance")}
        onPayroll={() => setModal("payroll")}
        onEdit={() => setModal("form")}
      />
      <StaffRoleModal
        key={`role-${target?.id ?? "none"}`}
        staff={modal === "role" ? target : null}
        onClose={close}
        onConfirm={page.assignRole}
      />
      <StaffAttendanceModal
        staff={modal === "attendance" ? target : null}
        onClose={close}
        onMark={page.markAttendance}
      />
      <StaffPayrollModal
        staff={modal === "payroll" ? target : null}
        onClose={close}
        onPayNow={page.processSalary}
      />
      <StaffDeleteModal
        staff={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteStaff}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Staff;
