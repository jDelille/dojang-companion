import { useState } from "react";
import { CalendarCheck, CalendarClock, X } from "lucide-react";
import type { GymClass } from "../../../types/classes";
import { CLASS_REPEATS, DAY_OPTIONS } from "../../../utils/json/classesData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Schedule Class — ported from #modal-schedule in tailwind/src/classes.html and
   openSchedule()/confirmSchedule() in assets/js/classes.js. Seeds from the
   class's current day + time.
*/

const REPEAT_OPTIONS = CLASS_REPEATS.map((value) => ({ value, label: value }));

type ClassScheduleModalProps = {
  target: GymClass | null;
  onClose: () => void;
  onConfirm: (id: number, day: number, time: string, repeat: string) => void;
};

const ClassScheduleModal = ({ target, onClose, onConfirm }: ClassScheduleModalProps) => {
  const open = target !== null;
  const [day, setDay] = useState(String(target?.day ?? 0));
  const [time, setTime] = useState(target?.time ?? "");
  const [repeat, setRepeat] = useState(CLASS_REPEATS[0]);

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
              <CalendarClock className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Schedule Class</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-gold ctx-box">
          {target ? `${target.name} · ${target.trainer}` : "—"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Day</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
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
              className="fp-input py-2.5 text-sm"
              placeholder="06:00 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Repeat</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Repeat"
              options={REPEAT_OPTIONS}
              value={repeat}
              onChange={(option) => setRepeat(option?.value ?? CLASS_REPEATS[0])}
            />
          </div>
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
              onConfirm(target.id, Number(day), time, repeat);
              onClose();
            }}
          >
            <CalendarCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassScheduleModal;
