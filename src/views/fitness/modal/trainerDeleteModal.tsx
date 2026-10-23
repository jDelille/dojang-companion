import { Trash2 } from "lucide-react";
import type { Trainer } from "../../../types/trainers";
import { fullName } from "../useTrainers";

/*
   Remove Trainer — ported from #modal-delete in tailwind/src/trainers.html and
   openDelete()/confirmDelete() in assets/js/trainers.js.
*/

type TrainerDeleteModalProps = {
  trainer: Trainer | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const TrainerDeleteModal = ({ trainer, onClose, onConfirm }: TrainerDeleteModalProps) => {
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
      <div className="modal-box modal-w-380">
        <div className="danger-ic">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Remove Trainer?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Permanently remove{" "}
          <span className="font-semibold c-text">
            {trainer ? fullName(trainer) : "this trainer"}
          </span>{" "}
          from the roster? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!trainer) return;
              onConfirm(trainer.id);
              onClose();
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerDeleteModal;
