import { Trash2 } from "lucide-react";
import type { Locker } from "../../../types/lockers";

/*
   Delete Locker — ported from #modal-delete in tailwind/src/lockers.html and
   openDelete()/confirmDelete() in assets/js/lockers.js. The warning box appears
   only when one or more targets are still assigned.
*/

type LockerDeleteModalProps = {
  targets: Locker[];
  onClose: () => void;
  onConfirm: (ids: number[]) => void;
};

const LockerDeleteModal = ({ targets, onClose, onConfirm }: LockerDeleteModalProps) => {
  const open = targets.length > 0;
  const name =
    targets.length === 1
      ? "Locker " + targets[0].num
      : targets.length + " lockers (" + targets.map((l) => l.num).join(", ") + ")";
  const busy = targets.filter((l) => l.status === "Occupied" || l.status === "Reserved");

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dl-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-380">
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 id="dl-title" className="text-base font-black c-text text-center mb-1">
          Remove Locker?
        </h3>
        <p className="text-sm text-center mb-4 c-dim">
          Permanently remove <span className="font-semibold c-text">{name}</span> from the register.
          This cannot be undone.
        </p>
        <div className={`ctx-box mb-5${busy.length === 0 ? " hidden" : ""}`}>
          {busy.length > 0 && (
            <>
              <span className="c-orange font-semibold">Heads up:</span>{" "}
              {busy.length +
                (busy.length === 1 ? " locker is" : " lockers are") +
                " still assigned (" +
                busy
                  .slice(0, 3)
                  .map((l) => l.num + " → " + l.member)
                  .join(", ") +
                (busy.length > 3 ? " +" + (busy.length - 3) + " more" : "") +
                "). Deleting will drop the assignment and any deposit record."}
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              onConfirm(targets.map((l) => l.id));
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

export default LockerDeleteModal;
