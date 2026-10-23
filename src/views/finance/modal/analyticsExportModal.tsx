import { useState } from "react";
import { Download, X } from "lucide-react";
import type { AnalyticsView } from "../../../types/analytics";
import { AN_FORMATS, PERIODS } from "../../../utils/json/analyticsData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Export Analytics — ported from #modal-export in tailwind/src/analytics.html
   and openExport()/confirmExport() in assets/js/analytics.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

const CONTEXT: Record<AnalyticsView, string> = {
  weekly: "Weekly Revenue",
  goals: "Monthly Goals",
  ring: "Full analytics dashboard",
  all: "Full analytics dashboard",
};

type AnalyticsExportModalProps = {
  open: boolean;
  /** Which panel triggered the export, driving the context line. */
  view: AnalyticsView;
  period: string;
  onClose: () => void;
  onConfirm: (format: string) => void;
};

const AnalyticsExportModal = ({
  open,
  view,
  period,
  onClose,
  onConfirm,
}: AnalyticsExportModalProps) => {
  const [format, setFormat] = useState(AN_FORMATS[0]);
  const [range, setRange] = useState(period);

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
          <h3 className="text-base font-black c-text">Export Analytics</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">{CONTEXT[view]}</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Format</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Format"
              options={toOptions(AN_FORMATS)}
              value={format}
              onChange={(option) => setFormat(option?.value ?? AN_FORMATS[0])}
            />
          </div>
          <div>
            <label className="f-label">Range</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Range"
              options={toOptions(PERIODS)}
              value={range}
              onChange={(option) => setRange(option?.value ?? period)}
            />
          </div>
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

export default AnalyticsExportModal;
