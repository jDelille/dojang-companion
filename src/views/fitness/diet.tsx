import { useState } from "react";
import {
  CalendarClock,
  Copy,
  Download,
  Dumbbell,
  Edit2,
  Egg,
  Eye,
  Flame,
  Leaf,
  MoreVertical,
  Plus,
  Salad,
  Scale,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { DietPlan } from "../../types/diet";
import {
  C_COL,
  DIET_TYPES,
  F_COL,
  P_COL,
  TYPE_BADGE,
} from "../../utils/json/dietData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import { DIET_GOAL_ICON } from "./dietIcons";
import useDiet, { macroPct, ringDegrees } from "./useDiet";
import DietPlanModal from "./modal/dietPlanModal";
import DietFormModal from "./modal/dietFormModal";
import DietAssignModal from "./modal/dietAssignModal";
import DietScheduleModal from "./modal/dietScheduleModal";
import DietDeleteModal from "./modal/dietDeleteModal";

/*
   Diet Plans — ported from tailwind/src/diet.html and assets/js/diet.js.
   Nutrition plan cards, calorie rings, macro bars and the full modal suite.
*/

const GOAL_TABS = [
  { goal: "All", label: "All Goals", Icon: null },
  { goal: "Weight Loss", label: "Weight Loss", Icon: Flame },
  { goal: "Muscle Gain", label: "Muscle Gain", Icon: Dumbbell },
  { goal: "Maintenance", label: "Maintenance", Icon: Scale },
  { goal: "Keto", label: "Keto", Icon: Egg },
];

type ModalKind = "plan" | "form" | "assign" | "schedule" | "delete";

const Diet = () => {
  const page = useDiet();
  const { filtered, plans, kpis, goal, setGoal, type, setType, search, setSearch } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const menuFor = (p: DietPlan) => (
    <RowMenu
      triggerClassName="diet-menu-btn"
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
        Assign Diet
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("schedule", p.id)}>
        <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Schedule
      </button>
      <button type="button" className="dropdown-item" onClick={() => page.duplicatePlan(p.id)}>
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
          <h2 className="text-xl font-black c-text">Diet Plans</h2>
          <p className="text-sm mt-0.5 c-dim">
            Nutrition programs, macros &amp; meal plans · Austin HQ
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
            New Diet Plan
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
          <div className="icon-box ic-gold">
            <Salad className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
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
            <div className="text-2xl font-black c-text leading-none">{kpis.calories}</div>
            <div className="text-xs font-medium mt-1 c-dim">Avg Calories</div>
          </div>
          <div className="icon-box ic-orange">
            <Flame className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.veg}</div>
            <div className="text-xs font-medium mt-1 c-dim">Vegetarian Plans</div>
          </div>
          <div className="icon-box ic-purple">
            <Leaf className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
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
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Types</option>
            {DIET_TYPES.map((value) => (
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
          const macro = macroPct(p);
          const deg = ringDegrees(p.calories);
          const Icon = DIET_GOAL_ICON[p.goal];
          return (
            <div
              key={p.id}
              className="diet-card reveal"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="goal-pill">
                    <Icon
                      style={{ width: "11px", height: "11px" }}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {p.goal}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`badge ${TYPE_BADGE[p.type]}`}>{p.type}</span>
                    {menuFor(p)}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="cal-ring"
                    style={{
                      borderRadius: "50%",
                      background: `conic-gradient(#D4AF37 ${deg}deg, #2E2E34 ${deg}deg)`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: "6px",
                        borderRadius: "50%",
                        background: "var(--card)",
                      }}
                    />
                    <div className="val">
                      <span className="text-base font-black c-text leading-none">
                        {p.calories}
                      </span>
                      <span className="text-[9px] c-dim2 font-bold">KCAL</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold c-text mb-2 truncate">{p.name}</div>
                    <div className="macro-seg mb-2">
                      <div style={{ width: `${macro.p}%`, background: P_COL }} />
                      <div style={{ width: `${macro.c}%`, background: C_COL }} />
                      <div style={{ width: `${macro.f}%`, background: F_COL }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] c-dim">
                      <span>P {p.protein}g</span>
                      <span>C {p.carbs}g</span>
                      <span>F {p.fat}g</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] c-dim mb-3">
                  <Users
                    style={{ width: "12px", height: "12px", color: "#D4AF37" }}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  {p.assigned} members assigned
                </div>
                <div className="flex items-center gap-2 pt-3 bd-t">
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
        <div className="text-[42px] opacity-30 mb-2">🥗</div>
        <div className="text-sm font-bold c-text">No diet plans found</div>
        <div className="text-xs mt-1 c-dim">Try a different goal, type, or search</div>
      </div>

      <div className="flex items-center justify-between mt-5 text-xs c-dim2">
        <span>
          Showing <span>{filtered.length}</span> of <span>{plans.length}</span> plans
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <DietPlanModal
        plan={modal === "plan" ? target : null}
        onClose={close}
        onEdit={() => setModal("form")}
        onAssign={() => setModal("assign")}
      />
      <DietFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.savePlan}
      />
      <DietAssignModal
        key={`assign-${target?.id ?? "none"}`}
        plan={modal === "assign" ? target : null}
        onClose={close}
        onConfirm={page.assignPlan}
      />
      <DietScheduleModal
        key={`schedule-${target?.id ?? "none"}`}
        plan={modal === "schedule" ? target : null}
        onClose={close}
        onConfirm={page.schedulePlan}
      />
      <DietDeleteModal
        plan={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deletePlan}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Diet;
