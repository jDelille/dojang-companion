import { useState } from "react";
import { X } from "lucide-react";
import type { DietPlan } from "../../../types/diet";
import { DIET_MEMBERS } from "../../../utils/json/dietData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Assign Diet Plan — ported from #modal-assign in tailwind/src/diet.html and
   openAssign()/confirmAssign() in assets/js/diet.js.
*/

const MEMBER_OPTIONS = DIET_MEMBERS.map((value) => ({ value, label: value }));

type DietAssignModalProps = {
  plan: DietPlan | null;
  onClose: () => void;
  onConfirm: (id: number, member: string) => void;
};

const DietAssignModal = ({ plan, onClose, onConfirm }: DietAssignModalProps) => {
  const open = plan !== null;
  const [member, setMember] = useState(DIET_MEMBERS[0]);

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
          <h3 className="text-base font-black c-text">Assign Diet Plan</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {plan ? `${plan.name} · ${plan.goal} · ${plan.calories} kcal` : "Plan"}
        </div>
        <div>
          <label className="f-label">Member</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Member"
            options={MEMBER_OPTIONS}
            value={member}
            onChange={(option) => setMember(option?.value ?? DIET_MEMBERS[0])}
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

export default DietAssignModal;
