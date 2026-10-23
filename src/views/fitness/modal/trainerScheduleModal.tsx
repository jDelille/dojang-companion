import { useState } from "react";
import { X } from "lucide-react";
import type { Trainer } from "../../../types/trainers";
import { SCHEDULE_REPEATS } from "../../../utils/json/trainersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import { fullName } from "../useTrainers";

/*
   Schedule Session — ported from #modal-schedule in tailwind/src/trainers.html
   and openSchedule()/confirmSchedule() in assets/js/trainers.js.
*/

const DAY_OPTIONS = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

const REPEAT_OPTIONS = SCHEDULE_REPEATS.map((value) => ({ value, label: value }));

type TrainerScheduleModalProps = {
  trainer: Trainer | null;
  onClose: () => void;
  /** Returns true when the session was added, so the modal can close. */
  onConfirm: (id: number, day: number, time: string, repeat: string) => boolean;
};

const TrainerScheduleModal = ({ trainer, onClose, onConfirm }: TrainerScheduleModalProps) => {
  const open = trainer !== null;
  const [day, setDay] = useState("0");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState(SCHEDULE_REPEATS[0]);

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
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black c-text text-lg">Schedule Session</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {trainer ? fullName(trainer) + " · " + trainer.spec : "Trainer"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Day</label>
            <CommonSelect
              ariaLabel="Day"
              options={DAY_OPTIONS}
              value={day}
              onChange={(option) => setDay(option?.value ?? "0")}
            />
          </div>
          <div>
            <label className="f-label">Time</label>
            <input
              type="text"
              className="fp-input"
              placeholder="6AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Repeat</label>
            <CommonSelect
              ariaLabel="Repeat"
              options={REPEAT_OPTIONS}
              value={repeat}
              onChange={(option) => setRepeat(option?.value ?? SCHEDULE_REPEATS[0])}
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
              if (!trainer) return;
              if (onConfirm(trainer.id, Number(day), time, repeat)) onClose();
            }}
          >
            Add Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerScheduleModal;
