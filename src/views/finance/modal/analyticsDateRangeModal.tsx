import { useState } from "react";
import { CalendarCheck, X } from "lucide-react";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Custom Date Range — ported from #modal-daterange in tailwind/src/analytics.html
   and openDateRange()/applyDateRange() in assets/js/analytics.js.

   The two flatpickr inputs (d M, Y) become CommonDatePickers, seeded with the
   same 2026-07-01 → 2026-07-14 defaults.
*/

type AnalyticsDateRangeModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (from: Date | null, to: Date | null) => boolean;
};

const AnalyticsDateRangeModal = ({
  open,
  onClose,
  onApply,
}: AnalyticsDateRangeModalProps) => {
  const [from, setFrom] = useState<Date | null>(new Date(2026, 6, 1));
  const [to, setTo] = useState<Date | null>(new Date(2026, 6, 14));

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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Custom Date Range</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">From</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="From"
              dateFormat="d M, yy"
              value={from}
              onChange={(e) => setFrom((e.value as Date | null) ?? null)}
            />
          </div>
          <div>
            <label className="f-label">To</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="To"
              dateFormat="d M, yy"
              value={to}
              onChange={(e) => setTo((e.value as Date | null) ?? null)}
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
              if (onApply(from, to)) onClose();
            }}
          >
            <CalendarCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDateRangeModal;
