import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { CheckinLogEntry } from "../../../types/checkin";

/*
   Delete Entry — ported from #modal-delete in tailwind/src/checkin.html and
   openDelete()/deleteConfirm() in assets/js/checkin.js.

   Raw markup: the dialog has no header row, leading with the danger icon.
*/

type CheckinDeleteModalProps = {
  entry: CheckinLogEntry | null;
  onClose: () => void;
  onConfirm: (entry: CheckinLogEntry) => void;
};

const CheckinDeleteModal = ({ entry, onClose, onConfirm }: CheckinDeleteModalProps) => {
  const open = entry !== null;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

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
      <div className="modal-box glass modal-w-360">
        <div className="danger-ic">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Delete Entry?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Remove <span className="font-semibold c-text">{entry?.name ?? "this entry"}</span>{" "}
          from today&apos;s log? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => entry && onConfirm(entry)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckinDeleteModal;
