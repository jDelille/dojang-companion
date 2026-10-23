import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import type { ClassCategory, ClassFormValues, GymClass } from "../../../types/classes";
import {
  CLASS_CATEGORIES,
  CLASS_TRAINERS,
  DAY_OPTIONS,
} from "../../../utils/json/classesData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Add / Edit Class — ported from #modal-edit in tailwind/src/classes.html and
   openAdd()/openEdit()/saveEdit() in assets/js/classes.js.

   Remounted with key={target?.id ?? "new"} so switching records reseeds the form.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type ClassFormModalProps = {
  open: boolean;
  target: GymClass | null;
  onClose: () => void;
  onSubmit: (values: ClassFormValues, editId: number | null) => boolean;
};

const ClassFormModal = ({ open, target, onClose, onSubmit }: ClassFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [cat, setCat] = useState<ClassCategory>(target?.cat ?? "Yoga");
  const [trainer, setTrainer] = useState(target?.trainer ?? CLASS_TRAINERS[0]);
  const [day, setDay] = useState(String(target?.day ?? 0));
  const [time, setTime] = useState(target?.time ?? "");
  const [dur, setDur] = useState(target?.dur ?? "60 min");
  const [room, setRoom] = useState(target?.room ?? "");
  const [cap, setCap] = useState(String(target?.cap ?? 20));

  const submit = () => {
    const accepted = onSubmit(
      { name, cat, trainer, day: Number(day), time, dur, room, cap: Number(cap) || 20 },
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
      <div className="modal-box glass modal-w-520">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <CalendarPlus className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">
              {target ? "Edit Class" : "Add Class"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Class Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Sunrise Yoga"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Category</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Category"
              options={toOptions(CLASS_CATEGORIES)}
              value={cat}
              onChange={(option) => setCat((option?.value as ClassCategory) ?? "Yoga")}
            />
          </div>
          <div>
            <label className="f-label">Trainer</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Trainer"
              options={toOptions(CLASS_TRAINERS)}
              value={trainer}
              onChange={(option) => setTrainer(option?.value ?? CLASS_TRAINERS[0])}
            />
          </div>
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
              placeholder="e.g. 06:00 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Duration</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. 60 min"
              value={dur}
              onChange={(e) => setDur(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Studio</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Studio A"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Capacity</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              placeholder="20"
              value={cap}
              onChange={(e) => setCap(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={submit}>
            Save Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassFormModal;
