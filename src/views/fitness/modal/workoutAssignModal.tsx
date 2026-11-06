import { useState } from "react";
import { X } from "lucide-react";
import type { WorkoutPlan } from "../../../types/workouts";
import { WORKOUT_MEMBERS } from "../../../utils/json/workoutsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Assign Workout — ported from #modal-assign in tailwind/src/workouts.html and
   openAssign()/confirmAssign() in assets/js/workouts.js.
*/

const MEMBER_OPTIONS = WORKOUT_MEMBERS.map((value) => ({ value, label: value }));

type WorkoutAssignModalProps = {
  plan: WorkoutPlan | null;
  onClose: () => void;
  onConfirm: (id: number, member: string) => void;
};

const WorkoutAssignModal = ({ plan, onClose, onConfirm }: WorkoutAssignModalProps) => {
  const open = plan !== null;
  const [member, setMember] = useState(WORKOUT_MEMBERS[0]);

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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Assign Workout</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {plan ? `${plan.name} · ${plan.goal} · ${plan.level}` : "Plan"}
        </div>
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
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!plan) return;
              onConfirm(plan.id, member);
              onClose();
            }}
          >
            Assign Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutAssignModal;
