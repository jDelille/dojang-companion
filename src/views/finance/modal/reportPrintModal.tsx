import { Printer, X } from "lucide-react";
import type { Report } from "../../../types/reports";

/*
   Print Report — ported from #modal-print in tailwind/src/reports.html and
   openPrint()/confirmPrint() in assets/js/reports.js.
*/

type ReportPrintModalProps = {
  report: Report | null;
  onClose: () => void;
  onConfirm: () => void;
};

const ReportPrintModal = ({ report, onClose, onConfirm }: ReportPrintModalProps) => {
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Print Report</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm mb-4 c-dim">
          Send <span className="font-semibold c-text">{report?.name ?? "this report"}</span> to
          the printer with current formatting?
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPrintModal;
