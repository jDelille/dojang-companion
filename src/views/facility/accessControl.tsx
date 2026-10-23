import { useState, type CSSProperties } from "react";
import {
  CheckCircle2,
  Copy,
  DoorOpen,
  Download,
  Eye,
  KeyRound,
  LogIn,
  LogOut,
  MoreVertical,
  Pencil,
  Search,
  ShieldAlert,
  ShieldPlus,
  Trash2,
  Unlock,
  Users,
  XCircle,
} from "lucide-react";
import type { AccessEvent, Role } from "../../types/accessControl";
import {
  DEVICES,
  LEVEL_BADGE,
  TYPE_META,
  avatarFor,
} from "../../utils/json/accessControlData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import {
  ALERT_ICON,
  DEVICE_ICON,
  METHOD_FALLBACK,
  METHOD_ICON,
  ROLE_FALLBACK,
  ROLE_ICON,
  TYPE_ICON,
} from "./accessControlIcons";
import useAccessControl, { initials } from "./useAccessControl";
import RoleFormModal from "./modal/roleFormModal";
import RoleViewModal from "./modal/roleViewModal";
import RoleAssignModal from "./modal/roleAssignModal";
import RoleCloneModal from "./modal/roleCloneModal";
import RoleDeleteModal from "./modal/roleDeleteModal";
import UnlockModal from "./modal/unlockModal";
import EventModal from "./modal/eventModal";

/*
   Access Control — ported from tailwind/src/access-control.html and
   assets/js/access-control.js. Devices, live access log, occupancy ring,
   security alerts and Roles & Permissions with the full modal suite:
   Add / Edit Role · View · Assign Permissions · Clone · Delete · Remote
   Unlock · Event details.
*/

const LOG_TABS = [
  { tab: "All", label: "All", Icon: null },
  { tab: "Granted", label: "Granted", Icon: CheckCircle2 },
  { tab: "Denied", label: "Denied", Icon: XCircle },
  { tab: "Exit", label: "Exits", Icon: LogOut },
];

/** Four signal bars, matching signalBars(). */
const SIGNAL_HEIGHTS = [6, 8, 10, 12];

type RoleModalKind = "form" | "view" | "assign" | "clone" | "delete";

const AccessControl = () => {
  const page = useAccessControl();
  const {
    roles,
    tab,
    setTab,
    door,
    setDoor,
    search,
    setSearch,
    kpis,
    tabCounts,
    occ,
    alerts,
    filteredLog,
  } = page;

  const [roleModal, setRoleModal] = useState<RoleModalKind | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const role = roleId != null ? page.findRole(roleId) : null;
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [event, setEvent] = useState<AccessEvent | null>(null);

  const openRole = (kind: RoleModalKind, id: number | null) => {
    setRoleId(id);
    setRoleModal(kind);
  };
  const closeRole = () => setRoleModal(null);

  const menuFor = (r: Role) => (
    <RowMenu
      triggerClassName="role-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => openRole("view", r.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Permissions
      </button>
      <button type="button" className="dropdown-item" onClick={() => openRole("form", r.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Role
      </button>
      <button type="button" className="dropdown-item" onClick={() => openRole("assign", r.id)}>
        <KeyRound className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Permissions
      </button>
      <button type="button" className="dropdown-item" onClick={() => openRole("clone", r.id)}>
        <Copy className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Clone Role
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => openRole("delete", r.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete Role
      </button>
    </RowMenu>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Access Control</h2>
          <p className="text-sm mt-0.5 c-dim">
            Door, RFID &amp; turnstile entry logs · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-active px-3 py-1.5">
            <span className="dot pulse-live bg-green-live" />
            Live
          </span>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportAccess}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setUnlockOpen(true)}
          >
            <Unlock className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Remote Unlock
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <LogIn className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.entries}</div>
            <div className="text-xs font-medium mt-1 c-dim">Entries Today</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Users className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.inside}</div>
            <div className="text-xs font-medium mt-1 c-dim">Currently Inside</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <ShieldAlert className="w-[18px] h-[18px] c-red shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.denied}</div>
            <div className="text-xs font-medium mt-1 c-dim">Denied Today</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <DoorOpen className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.online}</div>
            <div className="text-xs font-medium mt-1 c-dim">Devices Online</div>
          </div>
        </div>
      </div>

      {/* Devices */}
      <h3 className="font-bold c-text sec-title mb-3">Access Points</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {DEVICES.map((d) => {
          const online = d.status === "Online";
          const dotColor = online ? "#4ADE80" : "#F87171";
          const DevIcon = DEVICE_ICON[d.icon] ?? DoorOpen;
          const pct = d.battery || 80;
          return (
            <div key={d.name} className="dev-card">
              <div className="flex items-start justify-between mb-3">
                <div className={`dev-ic ${online ? "ic-gold" : "ic-red"}`}>
                  <DevIcon
                    className="w-[18px] h-[18px] shrink-0"
                    style={{ color: online ? "#D4AF37" : "#F87171" }}
                    aria-hidden="true"
                  />
                  <span
                    className={`dev-dot${online ? " pulse-live" : ""}`}
                    style={{ background: dotColor }}
                  />
                </div>
                <span className={`badge ${online ? "badge-present" : "badge-absent"}`}>
                  <span className="dot" />
                  {d.status}
                </span>
              </div>
              <div className="text-[13px] font-bold c-text">{d.name}</div>
              <div className="text-[11px] c-dim mt-0.5">{d.type + " · " + d.method}</div>
              <div className="flex items-center justify-between mt-3 pt-3 bd-t">
                {online ? (
                  <span className="signal">
                    {SIGNAL_HEIGHTS.map((h, i) => (
                      <i
                        key={h}
                        style={{ height: `${h}px`, opacity: pct >= (i + 1) * 20 ? 1 : 0.2 }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className="text-[10px] c-red font-bold">No signal</span>
                )}
                <button
                  type="button"
                  className={`text-[11px] font-bold ${online ? "c-gold" : "c-dim2"} flex items-center gap-1`}
                  disabled={!online}
                  onClick={() => page.deviceUnlock(d.name)}
                >
                  <Unlock style={{ width: "11px", height: "11px" }} className="shrink-0" aria-hidden="true" />
                  Unlock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {LOG_TABS.map(({ tab: value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={tab === value ? "ord-tab active" : "ord-tab"}
                  onClick={() => setTab(value)}
                >
                  {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
                  {label}{" "}
                  <span className="cnt">{tabCounts[value] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                className="fp-input py-2 text-sm w-auto"
                value={door}
                onChange={(e) => setDoor(e.target.value)}
              >
                <option value="All">All Doors</option>
                <option>Main Entrance</option>
                <option>Gym Floor</option>
                <option>Studio Wing</option>
                <option>Staff Only</option>
              </select>
              <div className="relative min-w-[150px]">
                <Search
                  className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  className="fp-input pl-9 py-2 text-sm"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-3">
              <h3 className="font-bold c-text sec-title">Live Access Log</h3>
              <span className="text-[11px] c-dim">Auto-refreshing</span>
            </div>
            <div className="px-3 pb-2 space-y-1">
              {filteredLog.map((e) => {
                const meta = TYPE_META[e.type];
                const TypeIcon = TYPE_ICON[meta.icon] ?? LogIn;
                const MethodIcon = METHOD_ICON[e.method] ?? METHOD_FALLBACK;
                return (
                  <div
                    key={e.id}
                    className="log-row"
                    onClick={() => setEvent(e)}
                  >
                    <div className={`log-ic ${meta.cls}`}>
                      <TypeIcon
                        className="w-[15px] h-[15px] shrink-0"
                        style={{ color: meta.color }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className={`ac-avatar av ${avatarFor(e.id)}`}>{initials(e.name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold c-text truncate">
                        {e.name}
                        {e.reason && <span className="c-red text-[11px]">{" · " + e.reason}</span>}
                      </div>
                      <div className="text-[11px] c-dim">{e.door}</div>
                    </div>
                    <span className="method-chip">
                      <MethodIcon style={{ width: "10px", height: "10px" }} className="shrink-0" aria-hidden="true" />
                      {e.method}
                    </span>
                    <div className="text-right" style={{ minWidth: "74px" }}>
                      <span className={`badge ${meta.badge}`}>{e.type}</span>
                      <div className="text-[10px] c-dim2 mt-1 font-mono">{e.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={`text-center py-12${filteredLog.length !== 0 ? " hidden" : ""}`}>
              <div className="text-[34px] opacity-30 mb-2">🚪</div>
              <div className="text-sm font-bold c-text">No events</div>
              <div className="text-xs mt-1 c-dim">Try a different tab, door, or search</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bd-t">
              <span className="text-xs c-dim2">
                Showing <span>{filteredLog.length}</span> of <span>{page.logTotal}</span> events
              </span>
            </div>
          </div>
        </div>

        {/* Occupancy + alerts */}
        <div className="space-y-5">
          <div className="glass-card p-5 text-center">
            <h3 className="font-bold c-text sec-title mb-4 text-left">Live Occupancy</h3>
            <div
              className="occ-ring mx-auto"
              style={{ "--deg": `${occ.deg}deg` } as CSSProperties}
            >
              <div className="occ-ring-inner" />
              <div className="occ-ring-content">
                <span className="text-2xl font-black gt leading-none">{occ.count}</span>
                <span className="text-[10px] c-dim2 font-bold">
                  / <span>{occ.cap}</span>
                </span>
              </div>
            </div>
            <div className={occ.cls}>{occ.label}</div>
            <div className="text-[11px] c-dim mt-1">Capacity utilisation</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold c-text sec-title">Security Alerts</h3>
              <span className="badge badge-expired">{alerts.length}</span>
            </div>
            <div className="space-y-2.5">
              {alerts.length ? (
                alerts.map((a, i) => {
                  const AlertIcon = ALERT_ICON[a.icon] ?? ShieldAlert;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-xl"
                      style={{ background: "var(--card2)", border: "1px solid var(--border)" }}
                    >
                      <div className="log-ic" style={{ background: a.color + "1a" }}>
                        <AlertIcon
                          className="w-[15px] h-[15px] shrink-0"
                          style={{ color: a.color }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold c-text truncate">{a.title}</div>
                        <div className="text-[11px] c-dim">{a.sub}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs c-dim text-center py-4">No active alerts ✓</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="flex items-center justify-between mt-8 mb-3">
        <h3 className="font-bold c-text sec-title">
          Roles &amp; Permissions{" "}
          <span className="text-xs c-dim2 font-medium">
            (<span>{roles.length}</span>)
          </span>
        </h3>
        <button
          type="button"
          className="btn-gold flex items-center gap-2 px-4 py-2 text-sm"
          onClick={() => openRole("form", null)}
        >
          <ShieldPlus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
          Add Role
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((r) => {
          const shown = r.perms.slice(0, 4);
          const extra = r.perms.length - shown.length;
          const RoleIcon = ROLE_ICON[r.icon] ?? ROLE_FALLBACK;
          return (
            <div
              key={r.id}
              className="role-card"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                openRole("view", r.id);
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="role-ic">
                  <RoleIcon className="w-[20px] h-[20px] c-gold shrink-0" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold c-text truncate">{r.name}</div>
                  <span className={`badge ${LEVEL_BADGE[r.level]}`}>{r.level}</span>
                </div>
                {menuFor(r)}
              </div>
              <p className="text-[12px] c-dim leading-relaxed mb-3">{r.desc}</p>
              <div className="perm-list mb-3">
                {shown.map((p) => (
                  <span key={p} className="perm-tag">
                    {p}
                  </span>
                ))}
                {extra > 0 && <span className="perm-tag">{"+" + extra}</span>}
              </div>
              <div className="flex items-center justify-between pt-3 bd-t text-[11px] c-dim">
                <span className="flex items-center gap-1">
                  <Users style={{ width: "12px", height: "12px" }} className="shrink-0" aria-hidden="true" />
                  {r.users + " users"}
                </span>
                <span className="flex items-center gap-1">
                  <KeyRound style={{ width: "12px", height: "12px" }} className="shrink-0" aria-hidden="true" />
                  {r.perms.length + " permissions"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <RoleFormModal
        key={`form-${role?.id ?? "new"}`}
        open={roleModal === "form"}
        target={roleModal === "form" ? role : null}
        onClose={closeRole}
        onSubmit={page.saveRole}
      />
      <RoleViewModal
        role={roleModal === "view" ? role : null}
        onClose={closeRole}
        onAssign={() => setRoleModal("assign")}
        onEdit={() => setRoleModal("form")}
      />
      <RoleAssignModal
        key={`assign-${role?.id ?? "none"}`}
        role={roleModal === "assign" ? role : null}
        onClose={closeRole}
        onConfirm={page.assignPerms}
      />
      <RoleCloneModal
        key={`clone-${role?.id ?? "none"}`}
        role={roleModal === "clone" ? role : null}
        onClose={closeRole}
        onConfirm={page.cloneRole}
      />
      <RoleDeleteModal
        role={roleModal === "delete" ? role : null}
        onClose={closeRole}
        onConfirm={page.deleteRole}
      />
      <UnlockModal
        open={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        onConfirm={page.remoteUnlock}
      />
      <EventModal event={event} onClose={() => setEvent(null)} />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default AccessControl;
