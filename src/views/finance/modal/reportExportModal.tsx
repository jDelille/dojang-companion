import { useState } from "react";
import { Download, X } from "lucide-react";
import type { Report } from "../../../types/reports";
import { REPORT_FORMATS } from "../../../utils/json/reportsData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Export — ported from #modal-export in tailwind/src/reports.html and
   openExport()/confirmExport() in assets/js/reports.js. A null report means the
   whole current view rather than a single file.
*/

const FORMAT_OPTIONS = REPORT_FORMATS.map((value) => ({ value, label: value }));

type ReportExportModalProps = {
  open: boolean;
  /** null → "All reports in the current view". */
  report: Report | null;
  onClose: () => void;
  onConfirm: (format: string) => void;
};

const ReportExportModal = ({ open, report, onClose, onConfirm }: ReportExportModalProps) => {
  const [format, setFormat] = useState(REPORT_FORMATS[0]);

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
          <h3 className="text-base font-black c-text">Export</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {report ? "Report: " + report.name : "All reports in the current view"}
        </div>
        <div>
          <label className="f-label">Format</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Format"
            options={FORMAT_OPTIONS}
            value={format}
            onChange={(option) => setFormat(option?.value ?? REPORT_FORMATS[0])}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onConfirm(format);
              onClose();
            }}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;
