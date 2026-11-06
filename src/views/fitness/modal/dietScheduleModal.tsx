import { useState } from "react";
import { X } from "lucide-react";
import type { DietPlan } from "../../../types/diet";
import { DIET_MEMBERS } from "../../../utils/json/dietData";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Schedule Plan — ported from #modal-schedule in tailwind/src/diet.html and
   openSchedule()/confirmSchedule() in assets/js/diet.js.

   The template's flatpickr input (data-provider="flatpickr", d M, Y) becomes the
   shared CommonDatePicker, seeded with the same 2026-07-20 default.
*/

const MEMBER_OPTIONS = DIET_MEMBERS.map((value) => ({ value, label: value }));

type DietScheduleModalProps = {
  plan: DietPlan | null;
  onClose: () => void;
  onConfirm: (id: number, member: string, date: Date | null) => boolean;
};

const DietScheduleModal = ({ plan, onClose, onConfirm }: DietScheduleModalProps) => {
  const open = plan !== null;
  const [member, setMember] = useState(DIET_MEMBERS[0]);
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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Schedule Plan</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {plan ? `${plan.name} · ${plan.type} · ${plan.calories} kcal/day` : "Plan"}
        </div>
        <div className="grid grid-cols-2 gap-3">
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

export default DietScheduleModal;
