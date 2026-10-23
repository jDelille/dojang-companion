import { useState } from "react";
import { Download } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";

/*
   Export Attendance — ported from #modal-export in
   tailwind/src/attendance.html and initExport() in
   assets/js/attendance.js.
*/

const FORMATS = ["CSV", "Excel", "PDF"];

/* The template ships both date fields pre-filled with these values. */
const DEFAULT_FROM = new Date(2026, 6, 1);
const DEFAULT_TO = new Date(2026, 6, 13);

type AttendanceExportModalProps = {
  open: boolean;
  onClose: () => void;
  /** filtered: honour the current table filters; all: export every record. */
  onExport: (format: string, scope: "filtered" | "all") => void;
};

const AttendanceExportModal = ({
  open,
  onClose,
  onExport,
}: AttendanceExportModalProps) => {
  const [format, setFormat] = useState("CSV");
  const [from, setFrom] = useState<Date | null>(DEFAULT_FROM);
  const [to, setTo] = useState<Date | null>(DEFAULT_TO);
  const [applyFilters, setApplyFilters] = useState(true);

  return (
    <Modal open={open} onClose={onClose} title="Export Attendance" boxClassName="glass">
      <div className="mb-4">
        <label className="field-label">Format</label>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((name) => (
            <div
              key={name}
              className={name === format ? "radio-card active" : "radio-card"}
              onClick={() => setFormat(name)}
            >
              <span className="rc-dot" />
              {name}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <label className="field-label">From</label>
          <CommonDatePicker
            className="py-2 text-sm"
            dateFormat="d M, yy"
            ariaLabel="From date"
            value={from}
            onChange={(e) => setFrom((e.value as Date) ?? null)}
          />
        </div>
        <div>
          <label className="field-label">To</label>
          <CommonDatePicker
            className="py-2 text-sm"
            dateFormat="d M, yy"
            ariaLabel="To date"
            value={to}
            onChange={(e) => setTo((e.value as Date) ?? null)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs c-dim mt-3 cursor-pointer">
        <input
          type="checkbox"
          className="accent-[#D4AF37]"
          checked={applyFilters}
          onChange={(e) => setApplyFilters(e.target.checked)}
        />
        Apply current table filters to export
      </label>
      <div className="flex gap-3 mt-5">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={() => {
            onExport(format, applyFilters ? "filtered" : "all");
            onClose();
          }}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Download
        </button>
      </div>
    </Modal>
  );
};

export default AttendanceExportModal;
