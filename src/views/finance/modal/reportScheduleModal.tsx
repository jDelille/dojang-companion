import { useState } from "react";
import { CalendarClock, X } from "lucide-react";
import type { Report } from "../../../types/reports";
import { REPORT_FORMATS, REPORT_FREQS } from "../../../utils/json/reportsData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Schedule Report — ported from #modal-schedule in tailwind/src/reports.html and
   openSchedule()/confirmSchedule() in assets/js/reports.js. A null report means
   a custom scheduled report rather than an existing one.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type ReportScheduleModalProps = {
  open: boolean;
  /** null → "Custom scheduled report". */
  report: Report | null;
  onClose: () => void;
  onConfirm: (email: string, freq: string) => boolean;
};

const ReportScheduleModal = ({
  open,
  report,
  onClose,
  onConfirm,
}: ReportScheduleModalProps) => {
  const [freq, setFreq] = useState("Monthly");
  const [format, setFormat] = useState(REPORT_FORMATS[0]);
  const [email, setEmail] = useState("");

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Schedule Report</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {report ? "Report: " + report.name : "Custom scheduled report"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Frequency</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Frequency"
              options={toOptions(REPORT_FREQS)}
              value={freq}
              onChange={(option) => setFreq(option?.value ?? "Monthly")}
            />
          </div>
          <div>
            <label className="f-label">Format</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Format"
              options={toOptions(REPORT_FORMATS)}
              value={format}
              onChange={(option) => setFormat(option?.value ?? REPORT_FORMATS[0])}
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="f-label">Email recipients</label>
          <input
            type="email"
            className="fp-input py-2.5 text-sm"
            placeholder="finance@example.com, owner@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              if (onConfirm(email, freq)) onClose();
            }}
          >
            <CalendarClock className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportScheduleModal;
