import { Edit2, UserPlus, X } from "lucide-react";
import type { Exercise, WorkoutPlan } from "../../../types/workouts";
import { LEVEL_BADGE } from "../../../utils/json/workoutsData";
import GOAL_ICON from "../workoutGoalIcon";
import { daysPerWeek } from "../useWorkouts";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Workout Plan detail — ported from #modal-plan in tailwind/src/workouts.html
   and openView() in assets/js/workouts.js. A plan with no sample exercises
   renders the single placeholder row the template emitted.
*/

const PLACEHOLDER: Exercise[] = [{ name: "No exercises added yet", sets: "—", reps: "—" }];

type WorkoutPlanModalProps = {
  plan: WorkoutPlan | null;
  onClose: () => void;
  onEdit: () => void;
  onAssign: () => void;
};

const WorkoutPlanModal = ({ plan, onClose, onEdit, onAssign }: WorkoutPlanModalProps) => {
  const open = plan !== null;
  const Icon = plan ? GOAL_ICON[plan.goal] : null;
  const exercises = plan?.sample.length ? plan.sample : PLACEHOLDER;

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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Workout Plan</h3>
          </div>
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
            <span className={`badge ${plan ? LEVEL_BADGE[plan.level] : "badge-active"}`}>
              {plan?.level ?? "—"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 bd-t text-center">
            <div>
              <div className="text-lg font-black gt">{plan ? daysPerWeek(plan) : 0}</div>
              <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider">Days/Wk</div>
            </div>
            <div>
              <div className="text-lg font-black gt">{plan?.weeks ?? 0}</div>
              <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider">Weeks</div>
            </div>
            <div>
              <div className="text-lg font-black gt">{plan?.assigned ?? 0}</div>
              <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider">Assigned</div>
            </div>
          </div>
        </div>

        <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">
          Sample Session
        </div>
        <div className="space-y-2 mb-4">
          {exercises.map((ex, index) => (
            <div key={ex.name} className="ex-row">
              <div className="ex-num">{index + 1}</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold c-text">{ex.name}</div>
              </div>
              <div className="text-[12px] c-dim">
                <span className="c-gold font-bold">{ex.sets}</span> × {ex.reps}
              </div>
            </div>
          ))}
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

export default WorkoutPlanModal;
