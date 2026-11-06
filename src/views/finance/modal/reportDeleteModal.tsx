import { Trash2 } from "lucide-react";
import type { Report } from "../../../types/reports";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Report — ported from #modal-delete in tailwind/src/reports.html and
   openDelete()/confirmDelete() in assets/js/reports.js.
*/

type ReportDeleteModalProps = {
  report: Report | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ReportDeleteModal = ({ report, onClose, onConfirm }: ReportDeleteModalProps) => {
  const open = report !== null;

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
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Delete Report?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Remove <span className="font-semibold c-text">{report?.name ?? "this report"}</span>{" "}
          from the library? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!report) return;
              onConfirm(report.id);
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

export default ReportDeleteModal;
