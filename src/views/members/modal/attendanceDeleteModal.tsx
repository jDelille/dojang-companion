import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { AttendanceRecord } from "../../../types/attendance";

/*
   Remove Attendance Entry — ported from #modal-delete in
   tailwind/src/attendance.html and openDelete()/confirmDelete() in
   assets/js/attendance.js.

   Raw markup rather than components/common/Modal: the dialog has no header
   row, leading with the danger icon.
*/

type AttendanceDeleteModalProps = {
  record: AttendanceRecord | null;
  onClose: () => void;
  onConfirm: (record: AttendanceRecord) => void;
};

const AttendanceDeleteModal = ({
  record,
  onClose,
  onConfirm,
}: AttendanceDeleteModalProps) => {
  const open = record !== null;

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
      <div className="modal-box glass modal-w-380">
        <div className="text-center">
          <div className="danger-ic">
            <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
          </div>
          <h3 className="text-base font-black c-text mb-1">Remove Attendance Entry?</h3>
          <p className="text-sm c-dim mb-5">
            This will permanently remove{" "}
            <span className="font-semibold c-text">
              {record ? `${record.name} (${record.id})` : "this record"}
            </span>{" "}
            from the daily log. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              onClick={() => record && onConfirm(record)}
            >
              <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDeleteModal;
