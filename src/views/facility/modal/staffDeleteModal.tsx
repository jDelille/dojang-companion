import { Trash2 } from "lucide-react";
import type { StaffMember } from "../../../types/staff";

/*
   Remove Staff Member — ported from #modal-delete in tailwind/src/staff.html
   and confirmDelete() in assets/js/staff.js.
*/

type StaffDeleteModalProps = {
  staff: StaffMember | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const StaffDeleteModal = ({ staff, onClose, onConfirm }: StaffDeleteModalProps) => {
  const confirm = () => {
    if (staff) onConfirm(staff.id);
    onClose();
  };

  return (
    <div
      className={staff ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!staff}
    >
      <div className="modal-box glass modal-w-380">
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Remove Staff Member?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Permanently remove{" "}
          <span className="font-semibold c-text">{staff?.name ?? "this member"}</span> from the
          team? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger flex-1 py-2.5 text-sm" onClick={confirm}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDeleteModal;
