import { Wrench, X } from "lucide-react";
import type { Locker } from "../../../types/lockers";
import { fmtDate } from "../useLockers";

/*
   Maintenance History — ported from #modal-history in tailwind/src/lockers.html
   and openHistory() in assets/js/lockers.js.
*/

type LockerHistoryModalProps = {
  locker: Locker | null;
  onClose: () => void;
  onLogMaintenance: () => void;
};

const LockerHistoryModal = ({ locker, onClose, onLogMaintenance }: LockerHistoryModalProps) => {
  const open = locker !== null;

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sh-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-4">
          <h3 id="sh-title" className="text-base font-black c-text">
            {locker ? "Maintenance History · Locker " + locker.num : "Maintenance History"}
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="svc-scroll mb-5">
          {locker && locker.history.length ? (
            locker.history.map((h, i) => (
              <div key={i} className="svc-item">
                <div className="svc-dot">
                  <Wrench className="w-[14px] h-[14px] c-gold shrink-0" aria-hidden="true" />
                </div>
                <div className="svc-body">
                  <div className="svc-action">{h.action}</div>
                  <div className="svc-meta">
                    {fmtDate(h.date) + " · " + h.note + (h.tech && h.tech !== "—" ? " · " + h.tech : "")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs c-dim text-center py-8">
              No maintenance records for this locker yet
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onLogMaintenance}
          >
            <Wrench className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Log Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockerHistoryModal;
