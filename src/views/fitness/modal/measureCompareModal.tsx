import { useState } from "react";
import { X } from "lucide-react";
import type { MeasureLog } from "../../../types/bodyMeasurements";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Compare Progress — ported from #modal-compare in
   tailwind/src/body-measurements.html and fillCompareSelects()/renderCompare()
   in assets/js/body-measurements.js.

   Defaults to the oldest → newest entry, and recomputes on every select change
   rather than re-writing innerHTML.
*/

type CompareRowProps = {
  label: string;
  from: number;
  to: number;
  unit: string;
  /** True when a decrease is the desired direction (weight, BMI, fat). */
  goodDown: boolean;
};

const CompareRow = ({ label, from, to, unit, goodDown }: CompareRowProps) => {
  const d = to - from;
  const flat = Math.abs(d) < 0.05;
  const good = goodDown ? d < 0 : d > 0;
  const cls = flat ? "c-dim2" : good ? "c-green" : "c-red";

  return (
    <div className="detail-row">
      <span className="k">{label}</span>
      <span className="v">
        {from.toFixed(1)}
        {unit} → {to.toFixed(1)}
        {unit}{" "}
        <span className={cls}>
          ({d > 0 ? "+" : ""}
          {d.toFixed(1)}
          {unit})
        </span>
      </span>
    </div>
  );
};

type MeasureCompareModalProps = {
  open: boolean;
  log: MeasureLog[];
  onClose: () => void;
};

const MeasureCompareModal = ({ open, log, onClose }: MeasureCompareModalProps) => {
  const options = log.map((l) => ({ value: String(l.id), label: l.date }));
  const [from, setFrom] = useState(String(log[log.length - 1]?.id ?? ""));
  const [to, setTo] = useState(String(log[0]?.id ?? ""));

  const a = log.find((l) => String(l.id) === from) ?? null;
  const b = log.find((l) => String(l.id) === to) ?? null;

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
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Compare Progress</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="f-label">From</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="From"
              options={options}
              value={from}
              onChange={(option) => setFrom(option?.value ?? from)}
            />
          </div>
          <div>
            <label className="f-label">To</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="To"
              options={options}
              value={to}
              onChange={(option) => setTo(option?.value ?? to)}
            />
          </div>
        </div>
        <div className="mb-5">
          {a && b && (
            <>
              <CompareRow label="Weight" from={a.weight} to={b.weight} unit="lbs" goodDown />
              <CompareRow label="BMI" from={a.bmi} to={b.bmi} unit="" goodDown />
              <CompareRow label="Body Fat" from={a.fat} to={b.fat} unit="%" goodDown />
              <CompareRow
                label="Muscle"
                from={a.muscle}
                to={b.muscle}
                unit="lbs"
                goodDown={false}
              />
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasureCompareModal;
