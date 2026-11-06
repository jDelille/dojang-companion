import { useState } from "react";
import { X } from "lucide-react";
import type { PtSession } from "../../../types/ptSessions";
import { PT_TRAINERS } from "../../../utils/json/ptSessionsData";
import CommonSelect, { type Option } from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Reschedule Session — ported from #modal-reschedule in
   tailwind/src/pt-sessions.html and openReschedule()/confirmReschedule()
   in assets/js/pt-sessions.js.
*/

const TRAINER_OPTIONS = PT_TRAINERS.map((t) => ({ value: String(t.id), label: t.name }));

type PtRescheduleModalProps = {
  target: PtSession | null;
  slotOptions: (trainerId: number, exceptId?: number, includeSlot?: number) => Option[];
  onClose: () => void;
  onConfirm: (id: number, trainerId: number, slot: number) => boolean;
};

const PtRescheduleModal = ({
  target,
  slotOptions,
  onClose,
  onConfirm,
}: PtRescheduleModalProps) => {
  const open = target !== null;
  const [trainerId, setTrainerId] = useState(String(target?.trainerId ?? 0));
  const [slot, setSlot] = useState(target ? String(target.slot) : "");

  const times = slotOptions(Number(trainerId), target?.id, target?.slot);
  const slotValue = times.some((option) => option.value === slot)
    ? slot
    : (times[0]?.value ?? "");

  const contextTrainer = target
    ? PT_TRAINERS.find((t) => t.id === target.trainerId)?.name
    : null;

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
            <h3 className="text-base font-black c-text">Reschedule Session</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {target ? `${target.member} · ${contextTrainer}` : "Session"}
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="f-label">Time</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Time"
              options={times}
              value={slotValue}
              onChange={(option) => setSlot(option?.value ?? "")}
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
              if (!target) return;
              const next = slotValue === "" ? -1 : Number(slotValue);
              if (onConfirm(target.id, Number(trainerId), next)) onClose();
            }}
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default PtRescheduleModal;
