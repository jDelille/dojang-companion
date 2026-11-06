import { useState } from "react";
import { FilePlus, X } from "lucide-react";
import type { GenerateValues, ReportCategory } from "../../../types/reports";
import {
  GENERATE_TYPES,
  PERIOD_NAMES,
  REPORT_CATS,
  REPORT_FORMATS,
} from "../../../utils/json/reportsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Generate Report — ported from #modal-generate in tailwind/src/reports.html and
   openGenerate()/confirmGenerate() in assets/js/reports.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type ReportGenerateModalProps = {
  open: boolean;
  /** Seeds the Period select from the page's current selection. */
  period: string;
  onClose: () => void;
  onConfirm: (values: GenerateValues) => void;
};

const ReportGenerateModal = ({
  open,
  period,
  onClose,
  onConfirm,
}: ReportGenerateModalProps) => {
  const [type, setType] = useState(GENERATE_TYPES[0]);
  const [cat, setCat] = useState<ReportCategory>(REPORT_CATS[0]);
  const [genPeriod, setGenPeriod] = useState(period);
  const [fmt, setFmt] = useState(REPORT_FORMATS[0]);
  const [withCharts, setWithCharts] = useState(true);

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
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Generate Report</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Report type</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Report type"
                options={toOptions(GENERATE_TYPES)}
                value={type}
                onChange={(option) => setType(option?.value ?? GENERATE_TYPES[0])}
              />
            </div>
            <div>
              <label className="f-label">Category</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Category"
                options={toOptions(REPORT_CATS)}
                value={cat}
                onChange={(option) =>
                  setCat((option?.value as ReportCategory) ?? REPORT_CATS[0])
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Period</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Period"
                options={toOptions(PERIOD_NAMES)}
                value={genPeriod}
                onChange={(option) => setGenPeriod(option?.value ?? period)}
              />
            </div>
            <div>
              <label className="f-label">Format</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Format"
                options={toOptions(REPORT_FORMATS)}
                value={fmt}
                onChange={(option) => setFmt(option?.value ?? REPORT_FORMATS[0])}
              />
            </div>
          </div>
          <label className="toggle-row cursor-pointer">
            <span className="text-sm c-text2">Include charts &amp; visualisations</span>
            <input
              type="checkbox"
              className="chk-gold"
              checked={withCharts}
              onChange={(e) => setWithCharts(e.target.checked)}
            />
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              onClick={() => {
                onConfirm({ type, cat, fmt, period: genPeriod, withCharts });
                onClose();
              }}
            >
              <FilePlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerateModal;
