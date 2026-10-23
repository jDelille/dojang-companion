import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CalendarClock,
  Calendar,
  ClipboardList,
  DollarSign,
  Download,
  Edit2,
  Eye,
  LayoutGrid,
  List,
  MessageCircle,
  MoreVertical,
  Search,
  Star,
  Trash2,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import type { Trainer } from "../../types/trainers";
import { LEVELS, SPECS } from "../../utils/json/trainersData";
import { moneyWhole, usd } from "../../utils/formatUtils";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import TrainerStars from "./trainerStars";
import useTrainers, { fullName, pctOf } from "./useTrainers";
import TrainerFormModal from "./modal/trainerFormModal";
import TrainerViewModal from "./modal/trainerViewModal";
import TrainerAssignModal from "./modal/trainerAssignModal";
import TrainerScheduleModal from "./modal/trainerScheduleModal";
import TrainerAttendanceModal from "./modal/trainerAttendanceModal";
import TrainerPaymentModal from "./modal/trainerPaymentModal";
import TrainerMessageModal from "./modal/trainerMessageModal";
import TrainerDeleteModal from "./modal/trainerDeleteModal";
import { all_routes } from "../../routes/all_routes";

/*
   Trainer Management — ported from tailwind/src/trainers.html and
   assets/js/trainers.js. Grid / list views, filters, per-trainer action
   menu and the full modal suite.
*/

/** Month-over-month trend; 0 renders as an em dash, matching trendHtml(). */
const Trend = ({ value }: { value: number }) => {
  if (value === 0) return <span className="c-dim2">—</span>;
  return (
    <span className={value > 0 ? "c-green" : "c-red"}>
      {value > 0 ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
};

/** Which modal is showing; only one at a time, as in the template. */
type ModalKind =
  | "form"
  | "view"
  | "assign"
  | "schedule"
  | "attendance"
  | "payment"
  | "message"
  | "delete";

const Trainers = () => {
  const router = useRouter();
  const page = useTrainers();
  const {
    visibleTrainers,
    leaderboard,
    trainers,
    kpis,
    view,
    setView,
    search,
    setSearch,
    level,
    setLevel,
    spec,
    setSpec,
    sort,
    setSort,
  } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Per-trainer overflow menu — the same eight actions as menuItems(). */
  const menuFor = (t: Trainer) => (
    <RowMenu
      triggerClassName="trn-icon-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
    >
      <button
        type="button"
        className="dropdown-item"
        onClick={() => router.push(`${all_routes.trainerProfile}?id=${t.id}`)}
      >
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Profile
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", t.id)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Trainer
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("assign", t.id)}>
        <ClipboardList className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Classes
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("schedule", t.id)}>
        <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Schedule
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("attendance", t.id)}>
        <CalendarCheck className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Attendance
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("payment", t.id)}>
        <DollarSign className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Record Payment
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("message", t.id)}>
        <MessageCircle className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Message
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", t.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </RowMenu>
  );

  return (
    <>
      <div id="section-trainers" className="section active-section">
        {/* Page header */}
        <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black c-text">Trainer Management</h2>
            <p id="trn-subtitle" className="text-sm mt-0.5 c-dim">
              {kpis.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`btn-${view === "grid" ? "gold" : "ghost"} flex items-center gap-2 px-3.5 py-2 text-sm`}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Grid
            </button>
            <button
              type="button"
              className={`btn-${view === "list" ? "gold" : "ghost"} flex items-center gap-2 px-3.5 py-2 text-sm`}
              onClick={() => setView("list")}
            >
              <List className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              List
            </button>
            <button
              type="button"
              className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
              onClick={page.exportReport}
            >
              <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Export
            </button>
            <button
              type="button"
              className="btn-gold flex items-center gap-2 px-4 py-2 text-sm ml-1"
              onClick={() => open("form", null)}
            >
              <UserPlus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Add Trainer
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="sc-fitness reveal">
            <div>
              <div className="text-xl font-black c-text">{kpis.count}</div>
              <div className="text-xs font-medium c-dim">Active Trainers</div>
            </div>
            <div className="icon-box ic-gold">
              <Users className="w-4 h-4 c-gold shrink-0" aria-hidden="true" />
            </div>
          </div>
          <div className="sc-fitness reveal">
            <div>
              <div className="text-xl font-black c-text">{kpis.sessions}</div>
              <div className="text-xs font-medium c-dim">Sessions This Month</div>
            </div>
            <div className="icon-box ibox-yellow">
              <CalendarCheck className="w-4 h-4 c-yellow shrink-0" aria-hidden="true" />
            </div>
          </div>
          <div className="sc-fitness reveal">
            <div>
              <div className="text-xl font-black c-text">{kpis.commission}</div>
              <div className="text-xs font-medium c-dim">Total Commissions</div>
            </div>
            <div className="icon-box ic-green">
              <DollarSign className="w-4 h-4 c-green shrink-0" aria-hidden="true" />
            </div>
          </div>
          <div className="sc-fitness reveal">
            <div>
              <div className="text-xl font-black c-text">{kpis.rating}</div>
              <div className="text-xs font-medium c-dim">Avg Rating</div>
            </div>
            <div className="icon-box ic-orange">
              <Star className="w-4 h-4 c-orange shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="glass-card p-3 mb-6">
          <div className="trn-filters">
            <div className="trn-search">
              <Search aria-hidden="true" />
              <input
                type="text"
                className="fp-input"
                placeholder="Search trainers by name or specialization…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="fp-input trn-select"
              title="Filter by level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {["All", ...LEVELS].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              className="fp-input trn-select"
              title="Filter by specialization"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
            >
              {["All", ...SPECS].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              className="fp-input trn-select"
              title="Sort by"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="commission">Sort: Commission</option>
              <option value="rating">Sort: Rating</option>
              <option value="sessions">Sort: Sessions</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* Trainer grid / list */}
        <div className={`trn-grid mb-6${view === "list" ? " is-list" : ""}`}>
          {visibleTrainers.length === 0 && (
            <div className="trn-empty">
              <UserX aria-hidden="true" />
              No trainers match your filters.
            </div>
          )}

          {visibleTrainers.length > 0 &&
            view === "grid" &&
            visibleTrainers.map((t) => (
              <div key={t.id} className={`trn-card acc-${t.accent}`}>
                <div className="trn-bar" />
                <div className="trn-body">
                  <div className="trn-head">
                    <div className="trn-avatar-wrap">
                      <div className="trn-avatar">{t.initials}</div>
                      <span className={`trn-status ${t.online ? "on" : "off"}`} />
                    </div>
                    <div className="trn-head-right">
                      <span className="trn-level">{t.level}</span>
                      <div className="trn-stars">
                        <TrainerStars rating={t.rating} />
                      </div>
                    </div>
                  </div>
                  <div
                    className="trn-name"
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`${all_routes.trainerProfile}?id=${t.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        router.push(`${all_routes.trainerProfile}?id=${t.id}`);
                    }}
                  >
                    {fullName(t)}
                  </div>
                  <div className="trn-spec">{t.spec}</div>
                  <div className="trn-stats">
                    <div className="trn-stat">
                      <b>{t.sessions}</b>
                      <span>Sessions</span>
                    </div>
                    <div className="trn-stat">
                      <b>{t.members}</b>
                      <span>Members</span>
                    </div>
                    <div className="trn-stat">
                      <b>{t.rating.toFixed(1)}</b>
                      <span>Rating</span>
                    </div>
                  </div>
                  <div className="trn-comm-row">
                    <span className="lbl">Monthly Commission</span>
                    <span className="val">{moneyWhole(t.commission)}</span>
                  </div>
                  <div className="trn-track">
                    <div className="trn-fill" style={{ width: `${pctOf(t)}%` }} />
                  </div>
                  <div className="trn-actions">
                    <button
                      type="button"
                      className="trn-btn"
                      onClick={() => open("schedule", t.id)}
                    >
                      <Calendar className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      Schedule
                    </button>
                    <button
                      type="button"
                      className="trn-icon-btn"
                      title="Message"
                      onClick={() => open("message", t.id)}
                    >
                      <MessageCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                    </button>
                    {menuFor(t)}
                  </div>
                </div>
              </div>
            ))}

          {visibleTrainers.length > 0 &&
            view === "list" &&
            visibleTrainers.map((t) => (
              <div key={t.id} className={`trn-row acc-${t.accent}`}>
                <div className="trn-avatar-wrap">
                  <div className="trn-avatar">{t.initials}</div>
                  <span className={`trn-status ${t.online ? "on" : "off"}`} />
                </div>
                <div
                  className="trn-row-main"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`${all_routes.trainerProfile}?id=${t.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      router.push(`${all_routes.trainerProfile}?id=${t.id}`);
                  }}
                >
                  <div className="trn-row-name">
                    {fullName(t)} <span className="trn-level">{t.level}</span>
                  </div>
                  <div className="trn-row-spec">{t.spec}</div>
                </div>
                <div className="trn-row-metrics">
                  <div className="trn-row-metric">
                    <b>{t.sessions}</b>
                    <span>Sessions</span>
                  </div>
                  <div className="trn-row-metric">
                    <b>{t.members}</b>
                    <span>Members</span>
                  </div>
                  <div className="trn-row-metric">
                    <b>{t.rating.toFixed(1)}</b>
                    <span>Rating</span>
                  </div>
                  <div className="trn-row-metric">
                    <b style={{ color: "var(--acc)" }}>{moneyWhole(t.commission)}</b>
                    <span>Commission</span>
                  </div>
                </div>
                <div className="trn-row-actions">
                  <button
                    type="button"
                    className="trn-icon-btn"
                    title="Schedule"
                    onClick={() => open("schedule", t.id)}
                  >
                    <Calendar className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="trn-icon-btn"
                    title="Message"
                    onClick={() => open("message", t.id)}
                  >
                    <MessageCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                  </button>
                  {menuFor(t)}
                </div>
              </div>
            ))}
        </div>

        {/* Bottom: schedule + leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Weekly schedule */}
          <div className="glass-card p-5 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold c-text">This Week&apos;s Schedule</h3>
              <span className="text-xs font-semibold c-gold">Mon 13 – Sun 19 Jul</span>
            </div>
            <div className="overflow-x-auto">
              <table className="trn-sched w-full instyle-55">
                <thead>
                  <tr>
                    <th className="name-cell instyle-56">Trainer</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                    <th>Sun</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((t) => (
                    <tr key={t.id} className={`acc-${t.accent}`}>
                      <td className="name-cell">
                        {t.first} {t.last.charAt(0)}.
                      </td>
                      {t.week.map((slot, index) => (
                        <td key={index}>
                          {slot ? (
                            <span
                              className="sched-chip"
                              style={{
                                background: "color-mix(in srgb,var(--acc) 15%,transparent)",
                                color: "var(--acc)",
                              }}
                            >
                              {slot}
                            </span>
                          ) : (
                            <span className="sched-off">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commission leaderboard */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold c-text">Commission Board</h3>
              <span className="text-xs font-semibold c-gold">July 2026</span>
            </div>
            <div className="flex flex-col gap-2">
              {leaderboard.map((t, index) => (
                <div
                  key={t.id}
                  className={`lb-row acc-${t.accent}${index === 0 ? " rank-1" : ""}`}
                >
                  <div className="lb-rank">{index + 1}</div>
                  <div className="lb-av">{t.initials}</div>
                  <div className="lb-main">
                    <div className="lb-name">{fullName(t)}</div>
                    <div className="lb-sub">
                      {t.sessions} sessions · {t.members} members
                    </div>
                  </div>
                  <div className="lb-amt">
                    <b>{usd(t.commission)}</b>
                    <span>
                      <Trend value={t.trend} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 flex justify-between items-center bd-t">
              <span className="text-xs c-dim2">Total this month</span>
              <span className="font-black text-base gt">{kpis.commissionTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <TrainerFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveTrainer}
      />
      <TrainerViewModal
        trainer={modal === "view" ? target : null}
        onClose={close}
        onSchedule={() => setModal("schedule")}
        onPayment={() => setModal("payment")}
        onEdit={() => setModal("form")}
      />
      <TrainerAssignModal
        key={`assign-${target?.id ?? "none"}`}
        trainer={modal === "assign" ? target : null}
        onClose={close}
        onConfirm={page.assignClasses}
      />
      <TrainerScheduleModal
        key={`schedule-${target?.id ?? "none"}`}
        trainer={modal === "schedule" ? target : null}
        onClose={close}
        onConfirm={page.scheduleSession}
      />
      <TrainerAttendanceModal
        trainer={modal === "attendance" ? target : null}
        onClose={close}
      />
      <TrainerPaymentModal
        key={`payment-${target?.id ?? "none"}`}
        trainer={modal === "payment" ? target : null}
        onClose={close}
        onConfirm={page.recordPayment}
      />
      <TrainerMessageModal
        key={`message-${target?.id ?? "none"}`}
        trainer={modal === "message" ? target : null}
        onClose={close}
        onConfirm={page.sendMessage}
      />
      <TrainerDeleteModal
        trainer={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.removeTrainer}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Trainers;
