import { useState } from "react";
import { Check, X } from "lucide-react";
import type { MeasureFormValues, MeasureLog } from "../../../types/bodyMeasurements";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";

/*
   Log / Edit Measurement — ported from #modal-measure-form in
   tailwind/src/body-measurements.html and openForm()/submitForm() in
   assets/js/body-measurements.js.

   The template's flatpickr input (d M, Y) becomes CommonDatePicker, seeded
   from the entry's date or the 14 Jul 2026 default.
*/

const DEFAULT_DATE = new Date(2026, 6, 14);

const parseDate = (value: string | undefined) => {
  if (!value) return DEFAULT_DATE;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? DEFAULT_DATE : parsed;
};

type MeasureFormModalProps = {
  open: boolean;
  target: MeasureLog | null;
  onClose: () => void;
  onSubmit: (values: MeasureFormValues, editId: number | null) => boolean;
};

const MeasureFormModal = ({ open, target, onClose, onSubmit }: MeasureFormModalProps) => {
  const [date, setDate] = useState<Date | null>(parseDate(target?.date));
  const [weight, setWeight] = useState(target ? String(target.weight) : "");
  const [fat, setFat] = useState(target ? String(target.fat) : "");
  const [muscle, setMuscle] = useState(target ? String(target.muscle) : "");

  const submit = () => {
    const accepted = onSubmit(
      {
        date,
        weight: Number(weight),
        fat: Number(fat) || 0,
        muscle: Number(muscle) || 0,
      },
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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black c-text">
            {target ? "Edit Measurement" : "Log Measurement"}
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Date</label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                ariaLabel="Date"
                dateFormat="d M, yy"
                value={date}
                onChange={(e) => setDate((e.value as Date | null) ?? null)}
              />
            </div>
            <div>
              <label className="f-label">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                className="fp-input py-2.5 text-sm"
                placeholder="136.4"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                className="fp-input py-2.5 text-sm"
                placeholder="24.5"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Muscle Mass (lbs)</label>
              <input
                type="number"
                step="0.1"
                className="fp-input py-2.5 text-sm"
                placeholder="90.6"
                value={muscle}
                onChange={(e) => setMuscle(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeasureFormModal;
