import { ArrowDown, ArrowUp, Download, Minus, X } from "lucide-react";
import type { MeasureLog } from "../../../types/bodyMeasurements";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Progress History — ported from #modal-history in
   tailwind/src/body-measurements.html and openHistory() in
   assets/js/body-measurements.js.

   Each row's weight badge compares against the next-older entry; the oldest
   entry gets no badge at all.
*/

type MeasureHistoryModalProps = {
  open: boolean;
  log: MeasureLog[];
  onClose: () => void;
  onExport: () => void;
};

const MeasureHistoryModal = ({
  open,
  log,
  onClose,
  onExport,
}: MeasureHistoryModalProps) => (
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
          <h3 className="text-base font-black c-text">Progress History</h3>
        </div>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <div className="mb-5 scrollbox-y-56vh">
        {log.map((l, i) => {
          const prev = log[i + 1];
          const d = prev ? l.weight - prev.weight : 0;
          const flat = Math.abs(d) < 0.05;
          const Arrow = d < 0 ? ArrowDown : d > 0 ? ArrowUp : Minus;
          return (
            <div key={l.id} className="hist-row">
              <div>
                <div className="hist-date">{l.date}</div>
                <div className="text-[11px] c-dim2">
                  BMI {l.bmi.toFixed(1)} · Fat {l.fat.toFixed(1)}% · Muscle{" "}
                  {l.muscle.toFixed(1)} lbs
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hist-w">{l.weight.toFixed(1)} lbs</span>
                {prev && (
                  <span
                    className={`delta ${flat ? "delta-flat" : d < 0 ? "delta-down" : "delta-up"}`}
                  >
                    <Arrow
                      style={{ width: "10px", height: "10px" }}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {Math.abs(d).toFixed(1)} lbs
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onExport}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Export
        </button>
      </div>
    </div>
  </div>
);

export default MeasureHistoryModal;
