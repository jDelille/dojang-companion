import { useState } from "react";
import { X } from "lucide-react";
import type { PtSession } from "../../../types/ptSessions";
import { PT_TRAINERS } from "../../../utils/json/ptSessionsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import { slotLabel } from "../usePtSessions";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Assign Trainer — ported from #modal-assign-trainer in
   tailwind/src/pt-sessions.html and openAssignTrainer()/confirmAssignTrainer()
   in assets/js/pt-sessions.js. The hook rejects a trainer already booked in
   that slot, so the modal only closes on success.
*/

const TRAINER_OPTIONS = PT_TRAINERS.map((t) => ({ value: String(t.id), label: t.name }));

type PtAssignTrainerModalProps = {
  target: PtSession | null;
  onClose: () => void;
  onConfirm: (id: number, trainerId: number) => boolean;
};

const PtAssignTrainerModal = ({ target, onClose, onConfirm }: PtAssignTrainerModalProps) => {
  const open = target !== null;
  const [trainerId, setTrainerId] = useState(String(target?.trainerId ?? 0));

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
            <h3 className="text-base font-black c-text">Assign Trainer</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {target ? `${target.member} · ${slotLabel(target.slot)}` : "Session"}
        </div>
        <div>
          <label className="f-label">Trainer</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Trainer"
            options={TRAINER_OPTIONS}
            value={trainerId}
            onChange={(option) => setTrainerId(option?.value ?? "0")}
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
              if (!target) return;
              if (onConfirm(target.id, Number(trainerId))) onClose();
            }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default PtAssignTrainerModal;
