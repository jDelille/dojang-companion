import { Trash2 } from "lucide-react";
import type { GymClass } from "../../../types/classes";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Class — ported from #modal-delete in tailwind/src/classes.html and
   openDelete()/confirmDelete() in assets/js/classes.js.
*/

type ClassDeleteModalProps = {
  target: GymClass | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ClassDeleteModal = ({ target, onClose, onConfirm }: ClassDeleteModalProps) => {
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
        <div className="danger-ic">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Delete Class?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Permanently remove{" "}
          <span className="font-semibold c-text">{target?.name ?? "this class"}</span> from the
          schedule? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!target) return;
              onConfirm(target.id);
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassDeleteModal;
