import { Ban } from "lucide-react";
import type { GymClass } from "../../../types/classes";

/*
   Cancel Class — ported from #modal-cancel in tailwind/src/classes.html and
   openCancel()/confirmCancel() in assets/js/classes.js.
*/

type ClassCancelModalProps = {
  target: GymClass | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ClassCancelModal = ({ target, onClose, onConfirm }: ClassCancelModalProps) => {
  const open = target !== null;

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
        <div className="danger-ic warn-ic">
          <Ban className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Cancel Class?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Cancel <span className="font-semibold c-text">{target?.name ?? "this class"}</span>?
          Booked members will be notified and refunded.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Keep Class
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!target) return;
              onConfirm(target.id);
              onClose();
            }}
          >
            Cancel Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassCancelModal;
