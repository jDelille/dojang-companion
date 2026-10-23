import { useState } from "react";
import {
  Activity,
  Calendar,
  CalendarClock,
  ClipboardList,
  Clock,
  Copy,
  Download,
  Dumbbell,
  Edit2,
  Eye,
  Flame,
  Flower2,
  MoreVertical,
  Plus,
  Search,
  Star,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type { WorkoutPlan } from "../../types/workouts";
import {
  DOW,
  GOAL_GRADIENT,
  LEVEL_BADGE,
  WORKOUT_LEVELS,
} from "../../utils/json/workoutsData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import GOAL_ICON from "./workoutGoalIcon";
import useWorkouts, { daysPerWeek } from "./useWorkouts";
import WorkoutPlanModal from "./modal/workoutPlanModal";
import WorkoutFormModal from "./modal/workoutFormModal";
import WorkoutAssignModal from "./modal/workoutAssignModal";
import WorkoutScheduleModal from "./modal/workoutScheduleModal";
import WorkoutDeleteModal from "./modal/workoutDeleteModal";

/*
   Workout Plans — ported from tailwind/src/workouts.html and
   assets/js/workouts.js. Plan library cards, goal/level filters and the
   full modal suite.
*/

const GOAL_TABS = [
  { goal: "All", label: "All Goals", Icon: null },
  { goal: "Muscle Gain", label: "Muscle Gain", Icon: Dumbbell },
  { goal: "Fat Loss", label: "Fat Loss", Icon: Flame },
  { goal: "Strength", label: "Strength", Icon: Zap },
  { goal: "Endurance", label: "Endurance", Icon: Activity },
  { goal: "Mobility", label: "Mobility", Icon: Flower2 },
];

type ModalKind = "plan" | "form" | "assign" | "schedule" | "delete";

const Workouts = () => {
  const page = useWorkouts();
  const { filtered, plans, kpis, goal, setGoal, level, setLevel, search, setSearch } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const menuFor = (p: WorkoutPlan) => (
    <RowMenu
      triggerClassName="wk-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("plan", p.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Plan
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", p.id)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Plan
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("assign", p.id)}>
        <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Workout
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("schedule", p.id)}>
        <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Schedule
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => page.duplicatePlan(p.id)}
      >
        <Copy className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Duplicate
      </button>
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
          <h2 className="text-xl font-black c-text">Workout Plans</h2>
          <p className="text-sm mt-0.5 c-dim">
            Build &amp; assign training programs to members · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportPlans}
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
            New Plan
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.plans}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Plans</div>
          </div>
          <div className="icon-box ic-gold text-dark">
            <ClipboardList className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.assigned}</div>
            <div className="text-xs font-medium mt-1 c-dim">Members Assigned</div>
          </div>
          <div className="icon-box ic-green">
            <UserCheck className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.exercises}</div>
            <div className="text-xs font-medium mt-1 c-dim">Exercises Library</div>
          </div>
          <div className="icon-box ic-purple">
            <Dumbbell className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.popular}</div>
            <div className="text-xs font-medium mt-1 c-dim">Most Popular</div>
          </div>
          <div className="icon-box ic-orange">
            <Star className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {GOAL_TABS.map(({ goal: value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={goal === value ? "ord-tab active" : "ord-tab"}
              onClick={() => setGoal(value)}
            >
              {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="fp-input py-2 text-sm w-auto"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="All">All Levels</option>
            {WORKOUT_LEVELS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <div className="relative min-w-[180px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 py-2 text-sm"
              placeholder="Search plan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Plan grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5${filtered.length === 0 ? " hidden" : ""}`}
      >
        {filtered.map((p, index) => {
          const Icon = GOAL_ICON[p.goal];
          return (
            <div
              key={p.id}
              className="wk-card reveal"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <div className="wk-hero" style={{ background: GOAL_GRADIENT[p.goal] }}>
                {menuFor(p)}
                <span className={`badge ${LEVEL_BADGE[p.level]} lvl-pill`}>{p.level}</span>
                <Icon
                  style={{ width: "38px", height: "38px", color: "#0B0B0C" }}
                  className="shrink-0"
                  aria-hidden="true"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold c-text truncate">{p.name}</div>
                  <span className="goal-pill">{p.goal}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] c-dim mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar
                      style={{ width: "12px", height: "12px", color: "#D4AF37" }}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {daysPerWeek(p)} days/wk
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock
                      style={{ width: "12px", height: "12px", color: "#D4AF37" }}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {p.weeks} weeks
                  </span>
                  <span className="flex items-center gap-1">
                    <Users
                      style={{ width: "12px", height: "12px", color: "#D4AF37" }}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {p.assigned}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.days.map((on, i) => (
                    <div key={i} className={`day-chip ${on ? "day-on" : "day-off"}`}>
                      {DOW[i]}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 bd-t">
                  <button
                    type="button"
                    className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => open("plan", p.id)}
                  >
                    <Eye className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    View
                  </button>
                  <button
                    type="button"
                    className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => open("assign", p.id)}
                  >
                    <UserPlus className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    Assign
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      <div className={`text-center py-16${filtered.length === 0 ? "" : " hidden"}`}>
        <div className="text-[42px] opacity-30 mb-2">🏋️</div>
        <div className="text-sm font-bold c-text">No workout plans found</div>
        <div className="text-xs mt-1 c-dim">Try a different goal, level, or search</div>
      </div>

      <div className="flex items-center justify-between mt-5 text-xs c-dim2">
        <span>
          Showing <span>{filtered.length}</span> of <span>{plans.length}</span> plans
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <WorkoutPlanModal
        plan={modal === "plan" ? target : null}
        onClose={close}
        onEdit={() => setModal("form")}
        onAssign={() => setModal("assign")}
      />
      <WorkoutFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.savePlan}
      />
      <WorkoutAssignModal
        key={`assign-${target?.id ?? "none"}`}
        plan={modal === "assign" ? target : null}
        onClose={close}
        onConfirm={page.assignPlan}
      />
      <WorkoutScheduleModal
        key={`schedule-${target?.id ?? "none"}`}
        plan={modal === "schedule" ? target : null}
        onClose={close}
        onConfirm={page.schedulePlan}
      />
      <WorkoutDeleteModal
        plan={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deletePlan}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Workouts;
