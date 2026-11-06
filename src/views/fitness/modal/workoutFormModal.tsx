import { useState } from "react";
import { X } from "lucide-react";
import type {
  WorkoutFormValues,
  WorkoutGoal,
  WorkoutLevel,
  WorkoutPlan,
} from "../../../types/workouts";
import {
  DOW,
  WORKOUT_GOALS,
  WORKOUT_LEVELS,
} from "../../../utils/json/workoutsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   New / Edit Workout Plan — ported from #modal-workout-form in
   tailwind/src/workouts.html and openForm()/submitForm() in assets/js/workouts.js.

   The training-day toggles are state here rather than the template's
   classList.toggle('on') on each chip.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type WorkoutFormModalProps = {
  open: boolean;
  target: WorkoutPlan | null;
  onClose: () => void;
  onSubmit: (values: WorkoutFormValues, editId: number | null) => boolean;
};

const WorkoutFormModal = ({ open, target, onClose, onSubmit }: WorkoutFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [goal, setGoal] = useState<WorkoutGoal>(target?.goal ?? WORKOUT_GOALS[0]);
  const [level, setLevel] = useState<WorkoutLevel>(target?.level ?? WORKOUT_LEVELS[0]);
  const [weeks, setWeeks] = useState(String(target?.weeks ?? 8));
  const [days, setDays] = useState<number[]>(
    target ? target.days.slice() : [1, 0, 1, 0, 1, 0, 0],
  );

  const toggleDay = (index: number) =>
    setDays((prev) => prev.map((on, i) => (i === index ? (on ? 0 : 1) : on)));

  const submit = () => {
    const accepted = onSubmit(
      { name, goal, level, weeks: Number(weeks) || 1, days },
      target?.id ?? null,
    );
    if (accepted) onClose();
  };

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
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {target ? "Edit Workout Plan" : "New Workout Plan"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label">Plan Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Hypertrophy Builder"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="f-label">Goal</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Goal"
                options={toOptions(WORKOUT_GOALS)}
                value={goal}
                onChange={(option) => setGoal((option?.value as WorkoutGoal) ?? WORKOUT_GOALS[0])}
              />
            </div>
            <div>
              <label className="f-label">Level</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Level"
                options={toOptions(WORKOUT_LEVELS)}
                value={level}
                onChange={(option) =>
                  setLevel((option?.value as WorkoutLevel) ?? WORKOUT_LEVELS[0])
                }
              />
            </div>
            <div>
              <label className="f-label">Weeks</label>
              <input
                type="number"
                min="1"
                max="52"
                className="fp-input py-2.5 text-sm"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="f-label">Training Days</label>
            <div className="flex items-center gap-2">
              {DOW.map((label, index) => (
                <div
                  key={index}
                  className={days[index] ? "day-toggle on" : "day-toggle"}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleDay(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleDay(index);
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-gold flex-1 py-2.5 text-sm">
              {target ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutFormModal;
