import { Calendar, DollarSign, Edit2, X } from "lucide-react";
import type { Trainer } from "../../../types/trainers";
import { moneyWhole } from "../../../utils/formatUtils";
import { fullName } from "../useTrainers";
import TrainerStars from "../trainerStars";

/*
   Trainer Profile — ported from #modal-view in tailwind/src/trainers.html and
   openView() in assets/js/trainers.js. The modal box carries the trainer's
   accent class so the CSS variables (--acc / --acc2 / --acc-ink) resolve.
*/

type TrainerViewModalProps = {
  trainer: Trainer | null;
  onClose: () => void;
  onSchedule: () => void;
  onPayment: () => void;
  onEdit: () => void;
};

const TrainerViewModal = ({
  trainer,
  onClose,
  onSchedule,
  onPayment,
  onEdit,
}: TrainerViewModalProps) => {
  const open = trainer !== null;

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
      <div className={`modal-box modal-w-540 acc-${trainer?.accent ?? "gold"}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black c-text text-lg">Trainer Profile</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl bg-card2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl"
            style={{
              background: "linear-gradient(135deg,var(--acc),var(--acc2))",
              color: "var(--acc-ink)",
            }}
          >
            {trainer?.initials}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-black c-text">{trainer ? fullName(trainer) : ""}</div>
            <div className="text-sm mt-0.5" style={{ color: "var(--acc)" }}>
              {trainer?.spec}
            </div>
            <div className="text-sm mt-1 trn-stars">
              {trainer && <TrainerStars rating={trainer.rating} />}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xl font-black gt">
              {trainer ? moneyWhole(trainer.commission) : ""}
            </div>
            <div className="text-xs mt-0.5 c-dim">This Month</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-xl bg-[var(--card2)]">
            <div className="text-xl font-black c-text">{trainer?.sessions}</div>
            <div className="text-xs mt-0.5 c-dim">Sessions</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--card2)]">
            <div className="text-xl font-black c-text">{trainer?.members}</div>
            <div className="text-xs mt-0.5 c-dim">Members</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-card2">
            <div className="text-xl font-black gt">{trainer?.rating.toFixed(1)}</div>
            <div className="text-xs mt-0.5 c-dim">Rating</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div className="ctx-box">
            <div className="f-label mb-1">Level</div>
            <span className="c-text">{trainer?.level}</span>
          </div>
          <div className="ctx-box">
            <div className="f-label mb-1">Phone</div>
            <span className="c-text">{trainer?.phone || "—"}</span>
          </div>
          <div className="ctx-box">
            <div className="f-label mb-1">Email</div>
            <span className="c-text">{trainer?.email || "—"}</span>
          </div>
          <div className="ctx-box">
            <div className="f-label mb-1">Assigned Classes</div>
            <span className="c-text">
              {trainer?.classes.length ? trainer.classes.join(", ") : "None assigned"}
            </span>
          </div>
        </div>
        <div className="mb-5">
          <div className="f-label">Performance (last 6 months)</div>
          <div className="perf-bars">
            <i className="instyle-57" />
            <i className="instyle-58" />
            <i className="instyle-59" />
            <i className="instyle-60" />
            <i className="instyle-61" />
            <i className="peak instyle-62" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onSchedule}>
            <Calendar className="w-[13px] h-[13px] inline shrink-0" aria-hidden="true" /> Schedule
          </button>
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onPayment}>
            <DollarSign className="w-[13px] h-[13px] inline shrink-0" aria-hidden="true" /> Pay
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={onEdit}>
            <Edit2 className="w-[13px] h-[13px] inline shrink-0" aria-hidden="true" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerViewModal;
