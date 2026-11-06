import { useState } from "react";
import { CircleCheck, UserCog, X } from "lucide-react";
import type { GymClass } from "../../../types/classes";
import { ASSIGN_TRAINERS, TIMETABLE_DAYS } from "../../../utils/json/classesData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Assign Trainer — ported from #modal-trainer in tailwind/src/classes.html and
   openTrainer()/confirmTrainer() in assets/js/classes.js.
*/

const TRAINER_OPTIONS = ASSIGN_TRAINERS.map((value) => ({ value, label: value }));

type ClassTrainerModalProps = {
  target: GymClass | null;
  onClose: () => void;
  onConfirm: (id: number, trainer: string) => void;
};

const ClassTrainerModal = ({ target, onClose, onConfirm }: ClassTrainerModalProps) => {
  const open = target !== null;
  const [trainer, setTrainer] = useState(target?.trainer ?? ASSIGN_TRAINERS[0]);

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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <UserCog className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Assign Trainer</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-dim ctx-box">
          {target
            ? `${target.name} · ${TIMETABLE_DAYS[target.day].dow} ${target.time}`
            : "—"}
        </div>
        <div>
          <label className="f-label">Trainer</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Trainer"
            options={TRAINER_OPTIONS}
            value={trainer}
            onChange={(option) => setTrainer(option?.value ?? ASSIGN_TRAINERS[0])}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!target) return;
              onConfirm(target.id, trainer);
              onClose();
            }}
          >
            <CircleCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassTrainerModal;
