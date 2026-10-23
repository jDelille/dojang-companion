import { Edit2, UserPlus, X } from "lucide-react";
import type { DietPlan, Meal } from "../../../types/diet";
import { C_COL, F_COL, P_COL, TYPE_BADGE } from "../../../utils/json/dietData";
import { DIET_GOAL_ICON, MEAL_FALLBACK, MEAL_ICON } from "../dietIcons";
import { macroPct } from "../useDiet";

/*
   Diet Plan detail — ported from #modal-diet in tailwind/src/diet.html and
   openView() in assets/js/diet.js. A plan with no meals renders the single
   placeholder row the template emitted.
*/

const PLACEHOLDER: Meal[] = [{ slot: "Breakfast", name: "No meals added yet", kcal: 0 }];

type DietPlanModalProps = {
  plan: DietPlan | null;
  onClose: () => void;
  onEdit: () => void;
  onAssign: () => void;
};

const DietPlanModal = ({ plan, onClose, onEdit, onAssign }: DietPlanModalProps) => {
  const open = plan !== null;
  const Icon = plan ? DIET_GOAL_ICON[plan.goal] : null;
  const macro = plan ? macroPct(plan) : { p: 0, c: 0, f: 0 };
  const meals = plan?.meals.length ? plan.meals : PLACEHOLDER;

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Diet Plan</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="gold-border-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box ic-gold size-px-48">
              {Icon && <Icon className="w-[22px] h-[22px] c-gold shrink-0" aria-hidden="true" />}
            </div>
            <div className="flex-1">
              <div className="text-lg font-black c-text">{plan?.name ?? "—"}</div>
              <div className="text-[11px] c-gold font-semibold uppercase tracking-wider">
                {plan?.goal ?? "—"}
              </div>
            </div>
            <span className={`badge ${plan ? TYPE_BADGE[plan.type] : "badge-active"}`}>
              {plan?.type ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-4 pt-3 bd-t">
            <div className="text-center">
              <div className="text-2xl font-black gt leading-none">{plan?.calories ?? 0}</div>
              <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider mt-1">
                kcal / day
              </div>
            </div>
            <div className="flex-1">
              <div className="macro-seg mb-2">
                <div style={{ width: `${macro.p}%`, background: P_COL }} />
                <div style={{ width: `${macro.c}%`, background: C_COL }} />
                <div style={{ width: `${macro.f}%`, background: F_COL }} />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="macro-dot bg-gold-light-solid" />P{" "}
                  <b className="c-text">{plan?.protein ?? 0}g</b>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="macro-dot bg-cyan-solid" />C{" "}
                  <b className="c-text">{plan?.carbs ?? 0}g</b>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="macro-dot bg-orange-solid" />F{" "}
                  <b className="c-text">{plan?.fat ?? 0}g</b>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">
          Daily Meals
        </div>
        <div className="space-y-2 mb-4">
          {meals.map((meal) => {
            const MealIcon = MEAL_ICON[meal.slot] ?? MEAL_FALLBACK;
            return (
              <div key={meal.slot + meal.name} className="meal-row">
                <div className="meal-ic">
                  <MealIcon className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-wider c-dim2">
                    {meal.slot}
                  </div>
                  <div className="text-[13px] font-semibold c-text">{meal.name}</div>
                </div>
                <div className="text-[12px] font-bold c-gold">{meal.kcal} kcal</div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Edit2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onAssign}
          >
            <UserPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default DietPlanModal;
