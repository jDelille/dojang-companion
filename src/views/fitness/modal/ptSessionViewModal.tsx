import { CalendarClock, CircleCheck, Edit2, X } from "lucide-react";
import type { PtSession } from "../../../types/ptSessions";
import { PT_TRAINERS, ptAvatarFor } from "../../../utils/json/ptSessionsData";
import { initials, moneyWhole } from "../../../utils/formatUtils";
import { STATUS_BADGE, STATUS_LABEL, feeOf, slotLabel } from "../usePtSessions";

/*
   Session Details — ported from #modal-view in tailwind/src/pt-sessions.html and
   openView() in assets/js/pt-sessions.js. The Complete button is hidden unless
   the session is still scheduled.
*/

type PtSessionViewModalProps = {
  target: PtSession | null;
  onClose: () => void;
  onReschedule: () => void;
  onComplete: () => void;
  onEdit: () => void;
};

const PtSessionViewModal = ({
  target,
  onClose,
  onReschedule,
  onComplete,
  onEdit,
}: PtSessionViewModalProps) => {
  const open = target !== null;
  const trainer = target ? PT_TRAINERS.find((t) => t.id === target.trainerId) : null;

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
          <h3 className="text-base font-black c-text">Session Details</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
          <div
            className={`pt-avatar av ${target ? ptAvatarFor(target.trainerId) : "av-gold"}`}
          >
            {target ? initials(target.member) : "AB"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black c-text">{target?.member ?? "Member"}</div>
            <div className="text-[11px] c-dim">
              {target ? `${target.focus} · ${target.duration}` : "Focus · Duration"}
            </div>
          </div>
          <span className={`badge ${STATUS_BADGE[target?.status ?? "scheduled"]} ml-auto`}>
            <span className="dot" />
            {STATUS_LABEL[target?.status ?? "scheduled"]}
          </span>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Trainer</span>
            <span className="v">{trainer?.name ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Time</span>
            <span className="v">{target ? slotLabel(target.slot) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Focus</span>
            <span className="v">{target?.focus ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Duration</span>
            <span className="v">{target?.duration ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Session Fee</span>
            <span className="v gt">{target ? moneyWhole(feeOf(target)) : "—"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm"
            onClick={onReschedule}
          >
            <CalendarClock className="w-[13px] h-[13px] inline shrink-0" aria-hidden="true" />{" "}
            Reschedule
          </button>
          <button
            type="button"
            className={`btn-ghost flex-1 py-2.5 text-sm${target?.status === "scheduled" ? "" : " hidden"}`}
            onClick={onComplete}
          >
            <CircleCheck className="w-[13px] h-[13px] inline shrink-0" aria-hidden="true" />{" "}
            Complete
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={onEdit}>
            <Edit2 className="w-[13px] h-[13px] inline shrink-0" aria-hidden="true" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PtSessionViewModal;
