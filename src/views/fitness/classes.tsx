import { useState } from "react";
import {
  Activity,
  Ban,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Dumbbell,
  Edit2,
  Eye,
  Flame,
  Flower2,
  Gauge,
  LayoutGrid,
  MoreVertical,
  Music,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  User,
  UserCog,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type { GymClass } from "../../types/classes";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CATEGORY_ICON from "./classCategoryIcon";
import useClasses, { fillClass, pctOf } from "./useClasses";
import ClassDetailModal from "./modal/classDetailModal";
import ClassFormModal from "./modal/classFormModal";
import ClassScheduleModal from "./modal/classScheduleModal";
import ClassTrainerModal from "./modal/classTrainerModal";
import ClassBookModal from "./modal/classBookModal";
import ClassCancelModal from "./modal/classCancelModal";
import ClassDeleteModal from "./modal/classDeleteModal";

/*
   Class Schedule — ported from tailwind/src/classes.html and
   assets/js/classes.js. Weekly timetable, category tabs, search and the
   full modal suite.
*/

const TABS = [
  { cat: "All", Icon: LayoutGrid },
  { cat: "Yoga", Icon: Flower2 },
  { cat: "HIIT", Icon: Zap },
  { cat: "Strength", Icon: Dumbbell },
  { cat: "Cardio", Icon: Activity },
  { cat: "Zumba", Icon: Music },
];

type ModalKind = "detail" | "form" | "schedule" | "trainer" | "book" | "cancel" | "delete";

const Classes = () => {
  const page = useClasses();
  const { timetable, kpis, cat, setCat, search, setSearch } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Per-class overflow menu — Cancel flips to Restore once cancelled. */
  const menuFor = (c: GymClass) => (
    <RowMenu
      triggerClassName="cls-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("detail", c.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", c.id)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("trainer", c.id)}>
        <UserCog className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Trainer
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("book", c.id)}>
        <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Book Members
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("schedule", c.id)}>
        <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Reschedule
      </button>
      {c.cancelled ? (
        <button type="button" className="dropdown-item" onClick={() => page.restoreClass(c.id)}>
          <RotateCcw className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Restore Class
        </button>
      ) : (
        <button type="button" className="dropdown-item" onClick={() => open("cancel", c.id)}>
          <Ban className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Cancel Class
        </button>
      )}
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", c.id)}>
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
          <h2 className="text-xl font-black c-text">Class Schedule</h2>
          <p className="text-sm mt-0.5 c-dim">
            Weekly group classes, bookings &amp; trainers · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportSchedule}
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
            Add Class
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.week}</div>
            <div className="text-xs font-medium mt-1 c-dim">Classes / Week</div>
          </div>
          <div className="icon-box ic-gold">
            <CalendarDays className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.booked}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Booked</div>
          </div>
          <div className="icon-box ic-green">
            <Users className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.fill}</div>
            <div className="text-xs font-medium mt-1 c-dim">Avg Fill Rate</div>
          </div>
          <div className="icon-box ic-orange">
            <Gauge className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.full}</div>
            <div className="text-xs font-medium mt-1 c-dim">Full / Waitlist</div>
          </div>
          <div className="icon-box ic-red">
            <Flame className="w-[18px] h-[18px] c-red shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map(({ cat: value, Icon }) => (
            <button
              key={value}
              type="button"
              className={cat === value ? "ord-tab active" : "ord-tab"}
              onClick={() => setCat(value)}
            >
              <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {value}
            </button>
          ))}
        </div>
        <div className="relative min-w-[190px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search class or trainer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Weekly timetable */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text sec-title">This Week · Jul 13–19, 2026</h3>
          <div className="flex items-center gap-1.5">
            <button type="button" className="hbtn" title="Previous week" aria-label="Previous week">
              <ChevronLeft className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            </button>
            <button type="button" className="btn-ghost px-3 py-1.5 text-xs">
              Today
            </button>
            <button type="button" className="hbtn" title="Next week" aria-label="Next week">
              <ChevronRight className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="tt-scroll">
          <div className="tt-grid">
            {timetable.map(({ day, classes }) => (
              <div key={day.dow} className="tt-day">
                <div className={day.today ? "tt-head today" : "tt-head"}>
                  <div className="tt-dow">{day.dow}</div>
                  <div className="tt-date">{day.date}</div>
                </div>
                {classes.length === 0 && <div className="cls-empty">No classes</div>}
                {classes.map((c) => {
                  const pct = pctOf(c);
                  const full = c.booked >= c.cap;
                  const Icon = CATEGORY_ICON[c.cat];
                  return (
                    <div
                      key={c.id}
                      className={`cls cat-${c.cat}${c.cancelled ? " cancelled" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => open("detail", c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") open("detail", c.id);
                      }}
                    >
                      {menuFor(c)}
                      <div className="cls-time">{c.time}</div>
                      <div className="cls-name">{c.name}</div>
                      <div className="cls-meta">
                        <User className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                        {c.trainer}
                      </div>
                      <div className="cls-meta">
                        <Icon
                          className={`w-[11px] h-[11px] cc-${c.cat} shrink-0`}
                          aria-hidden="true"
                        />
                        {c.cat} · {c.dur}
                      </div>
                      <div className="fill-track">
                        <div
                          className={`fill-bar ${fillClass(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="cls-meta cls-meta-split">
                        <span>
                          {c.booked}/{c.cap}
                        </span>
                        <span className={c.cancelled || full ? "co-full" : "co-open"}>
                          {c.cancelled ? "CANCELLED" : full ? "FULL" : "Open"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <ClassDetailModal
        target={modal === "detail" ? target : null}
        onClose={close}
        onEdit={() => setModal("form")}
        onTrainer={() => setModal("trainer")}
        onCancel={() => setModal("cancel")}
        onBook={() => setModal("book")}
      />
      <ClassFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveClass}
      />
      <ClassScheduleModal
        key={`schedule-${target?.id ?? "none"}`}
        target={modal === "schedule" ? target : null}
        onClose={close}
        onConfirm={page.rescheduleClass}
      />
      <ClassTrainerModal
        key={`trainer-${target?.id ?? "none"}`}
        target={modal === "trainer" ? target : null}
        onClose={close}
        onConfirm={page.assignTrainer}
      />
      <ClassBookModal
        key={`book-${target?.id ?? "none"}`}
        target={modal === "book" ? target : null}
        onClose={close}
        onConfirm={page.bookSeats}
      />
      <ClassCancelModal
        target={modal === "cancel" ? target : null}
        onClose={close}
        onConfirm={page.cancelClass}
      />
      <ClassDeleteModal
        target={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteClass}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Classes;
