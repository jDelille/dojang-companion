import { Ban, Clock, Edit2, UserCog, UserPlus, X } from "lucide-react";
import type { GymClass } from "../../../types/classes";
import { TIMETABLE_DAYS } from "../../../utils/json/classesData";
import CATEGORY_ICON from "../classCategoryIcon";
import { fillClass, pctOf } from "../useClasses";

/*
   Class Details — ported from #modal-class in tailwind/src/classes.html and
   openClass() in assets/js/classes.js. The primary button flips to
   "Join Waitlist" when the class is full, and is disabled when full or cancelled.
*/

type ClassDetailModalProps = {
  target: GymClass | null;
  onClose: () => void;
  onEdit: () => void;
  onTrainer: () => void;
  onCancel: () => void;
  onBook: () => void;
};

const ClassDetailModal = ({
  target,
  onClose,
  onEdit,
  onTrainer,
  onCancel,
  onBook,
}: ClassDetailModalProps) => {
  const open = target !== null;
  const pct = target ? pctOf(target) : 0;
  const full = target ? target.booked >= target.cap : false;
  const Icon = target ? CATEGORY_ICON[target.cat] : null;

  const statusClass = target?.cancelled
    ? "badge-inactive"
    : full
      ? "badge-absent"
      : "badge-present";
  const statusLabel = target?.cancelled ? "Cancelled" : full ? "Full" : "Open";

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
          <h3 className="text-base font-black c-text">Class Details</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box ic-gold ic-48">
              {Icon && (
                <Icon
                  className={`w-[22px] h-[22px] cc-${target?.cat} shrink-0`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="text-lg font-black c-text">{target?.name ?? "—"}</div>
              <div className="text-[11px] c-gold font-semibold uppercase tracking-wider">
                {target?.cat ?? "—"}
              </div>
            </div>
            <span className={`badge ${statusClass}`}>
              <span className="dot" />
              {statusLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 bd-t">
            <div>
              <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
                Day &amp; Time
              </div>
              <div className="text-sm font-semibold c-text">
                {target
                  ? `${TIMETABLE_DAYS[target.day].dow} ${TIMETABLE_DAYS[target.day].date} · ${target.time}`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
                Duration
              </div>
              <div className="text-sm font-semibold c-text">{target?.dur ?? "—"}</div>
            </div>
            <div>
              <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
                Trainer
              </div>
              <div className="text-sm font-semibold c-text">{target?.trainer ?? "—"}</div>
            </div>
            <div>
              <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
                Studio
              </div>
              <div className="text-sm font-semibold c-text">{target?.room ?? "—"}</div>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold c-text2">Capacity</span>
            <span className="text-xs font-bold c-gold">
              {target ? `${target.booked} / ${target.cap}` : "0 / 0"}
            </span>
          </div>
          <div className="fill-track fill-track-lg">
            <div className={`fill-bar ${fillClass(pct)}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            type="button"
            className="btn-ghost py-2 text-xs flex items-center justify-center gap-1.5"
            onClick={onEdit}
          >
            <Edit2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="btn-ghost py-2 text-xs flex items-center justify-center gap-1.5"
            onClick={onTrainer}
          >
            <UserCog className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Trainer
          </button>
          <button
            type="button"
            className="btn-ghost py-2 text-xs flex items-center justify-center gap-1.5"
            onClick={onCancel}
          >
            <Ban className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Cancel
          </button>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            disabled={full || (target?.cancelled ?? false)}
            onClick={onBook}
          >
            {full && !target?.cancelled ? (
              <>
                <Clock className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                Join Waitlist
              </>
            ) : (
              <>
                <UserPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                Book Member
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailModal;
