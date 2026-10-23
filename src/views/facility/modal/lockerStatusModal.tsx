import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { Locker, LockerStatus } from "../../../types/lockers";
import { ICON_COLOR, STATUSES, STATUS_HINT, TINT } from "../../../utils/json/lockersData";
import { LOCKER_ICON, LOCKER_ICON_FALLBACK } from "../lockersIcons";

/*
   Change Locker Status — ported from #modal-status in tailwind/src/lockers.html
   and openStatus()/pickStatus()/confirmStatus() in assets/js/lockers.js.
   Choosing Occupied for lockers without a member routes to Assign (force).
*/

type LockerStatusModalProps = {
  targets: Locker[];
  onClose: () => void;
  onConfirm: (ids: number[], status: LockerStatus) => void;
  onNeedMember: (ids: number[]) => void;
};

const LockerStatusModal = ({ targets, onClose, onConfirm, onNeedMember }: LockerStatusModalProps) => {
  const open = targets.length > 0;
  const [pending, setPending] = useState<LockerStatus | null>(
    targets.length === 1 ? targets[0].status : null,
  );
  const [error, setError] = useState<string>("");

  const context =
    targets.length === 1
      ? "Locker " + targets[0].num + " · currently " + targets[0].status
      : targets.length + " lockers selected: " + targets.map((l) => l.num).join(", ");

  const confirm = () => {
    if (!pending) {
      setError("Choose a status");
      return;
    }
    /* Occupied needs a member — route through Assign instead of inventing one. */
    if (pending === "Occupied") {
      const noMember = targets.filter((l) => !l.member).map((l) => l.id);
      if (noMember.length) {
        onNeedMember(noMember);
        return;
      }
    }
    onConfirm(
      targets.map((l) => l.id),
      pending,
    );
    onClose();
  };

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="st-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-4">
          <h3 id="st-title" className="text-base font-black c-text">
            Change Locker Status
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">{context}</div>
        <div className="space-y-2 mb-4" role="radiogroup" aria-label="New status">
          {STATUSES.map((s) => {
            const on = s === pending;
            const Icon = LOCKER_ICON[s] ?? LOCKER_ICON_FALLBACK;
            return (
              <button
                key={s}
                type="button"
                className={`opt-card${on ? " sel" : ""}`}
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setPending(s);
                  setError("");
                }}
              >
                <span className={`opt-ic ${TINT[s]}`}>
                  <Icon className={`w-[15px] h-[15px] ${ICON_COLOR[s]} shrink-0`} aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-bold c-text">{s}</span>
                  <span className="block text-[11px] c-dim">{STATUS_HINT[s]}</span>
                </span>
                <Check
                  className={`w-[15px] h-[15px] c-gold shrink-0${on ? "" : " opacity-0"}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <div className={`f-error mb-3${error ? " show" : ""}`}>
          <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={confirm}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockerStatusModal;
