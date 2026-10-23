import { Edit2, X } from "lucide-react";
import type { MeasureLog } from "../../../types/bodyMeasurements";

/*
   Measurement Entry — ported from #modal-view in
   tailwind/src/body-measurements.html and openView() in
   assets/js/body-measurements.js.

   Each row shows the value plus its change against the *next* (older) entry;
   the oldest entry has no comparison and renders an em dash.
*/

type DeltaProps = {
  current: number;
  previous: number | undefined;
  unit: string;
};

const Delta = ({ current, previous, unit }: DeltaProps) => {
  if (previous === undefined) return <span className="c-dim2">—</span>;
  const d = current - previous;
  const flat = Math.abs(d) < 0.05;
  return (
    <span className={flat ? "c-dim2" : d < 0 ? "c-green" : "c-red"}>
      {d > 0 ? "+" : ""}
      {d.toFixed(1)}
      {unit}
    </span>
  );
};

type MeasureViewModalProps = {
  entry: MeasureLog | null;
  /** The next-older entry, or null when viewing the oldest. */
  previous: MeasureLog | null;
  onClose: () => void;
  onEdit: () => void;
};

const MeasureViewModal = ({ entry, previous, onClose, onEdit }: MeasureViewModalProps) => {
  const open = entry !== null;

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
      <div className="modal-box glass modal-w-380">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Measurement Entry</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Date</span>
            <span className="v">{entry?.date ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Weight</span>
            <span className="v">
              {entry ? entry.weight.toFixed(1) : "—"} lbs &nbsp;{" "}
              {entry && <Delta current={entry.weight} previous={previous?.weight} unit="lbs" />}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">BMI</span>
            <span className="v">
              {entry ? entry.bmi.toFixed(1) : "—"} &nbsp;{" "}
              {entry && <Delta current={entry.bmi} previous={previous?.bmi} unit="" />}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Body Fat</span>
            <span className="v">
              {entry ? entry.fat.toFixed(1) : "—"}% &nbsp;{" "}
              {entry && <Delta current={entry.fat} previous={previous?.fat} unit="%" />}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Muscle Mass</span>
            <span className="v">
              {entry ? entry.muscle.toFixed(1) : "—"} lbs &nbsp;{" "}
              {entry && <Delta current={entry.muscle} previous={previous?.muscle} unit="lbs" />}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Edit2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasureViewModal;
