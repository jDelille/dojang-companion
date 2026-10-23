import { useState } from "react";
import { X } from "lucide-react";
import type { WorkoutPlan } from "../../../types/workouts";
import { WORKOUT_MEMBERS } from "../../../utils/json/workoutsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import { daysPerWeek } from "../useWorkouts";

/*
   Schedule Plan — ported from #modal-schedule in tailwind/src/workouts.html and
   openSchedule()/confirmSchedule() in assets/js/workouts.js.

   The template's flatpickr input (data-provider="flatpickr", d M, Y) becomes the
   shared CommonDatePicker, seeded with the same 2026-07-20 default.
*/

const MEMBER_OPTIONS = WORKOUT_MEMBERS.map((value) => ({ value, label: value }));

type WorkoutScheduleModalProps = {
  plan: WorkoutPlan | null;
  onClose: () => void;
  onConfirm: (id: number, member: string, date: Date | null) => boolean;
};

const WorkoutScheduleModal = ({ plan, onClose, onConfirm }: WorkoutScheduleModalProps) => {
  const open = plan !== null;
  const [member, setMember] = useState(WORKOUT_MEMBERS[0]);
  const [date, setDate] = useState<Date | null>(new Date(2026, 6, 20));

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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Schedule Plan</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {plan
            ? `${plan.name} · ${daysPerWeek(plan)} days/wk · ${plan.weeks} weeks`
            : "Plan"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={MEMBER_OPTIONS}
              value={member}
              onChange={(option) => setMember(option?.value ?? WORKOUT_MEMBERS[0])}
            />
          </div>
          <div>
            <label className="f-label">Start Date</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="Start Date"
              dateFormat="d M, yy"
              value={date}
              onChange={(e) => setDate((e.value as Date | null) ?? null)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!plan) return;
              if (onConfirm(plan.id, member, date)) onClose();
            }}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutScheduleModal;
