import { useState } from "react";
import { Download, X } from "lucide-react";
import { PERIODS, PERIOD_STATS } from "../../../utils/json/analyticsData";
import type { PeriodStats } from "../../../types/analytics";
import CommonSelect from "../../../components/common-select/commonSelect";
import { usd } from "../../../utils/formatUtils";

/*
   Compare Analytics — ported from #modal-compare in tailwind/src/analytics.html
   and openCompare()/renderCompare() in assets/js/analytics.js.

   Defaults to This Week vs Last Week and recomputes on every select change.
*/

const PERIOD_OPTIONS = PERIODS.map((value) => ({ value, label: value }));

const ROWS: { key: keyof PeriodStats; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "members", label: "New Members" },
  { key: "retention", label: "Retention" },
  { key: "satisfaction", label: "Satisfaction" },
];

/** Revenue formats as compact USD, members as a bare count, the rest as %. */
const fmtVal = (key: keyof PeriodStats, value: number) =>
  key === "revenue" ? usd(value) : key === "members" ? String(value) : value + "%";

type AnalyticsCompareModalProps = {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
};

const AnalyticsCompareModal = ({ open, onClose, onExport }: AnalyticsCompareModalProps) => {
  const [a, setA] = useState("This Week");
  const [b, setB] = useState("Last Week");

  const statsA = PERIOD_STATS[a];
  const statsB = PERIOD_STATS[b];

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Compare Analytics</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="f-label">Period A</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Period A"
              options={PERIOD_OPTIONS}
              value={a}
              onChange={(option) => setA(option?.value ?? a)}
            />
          </div>
          <div>
            <label className="f-label">Period B</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Period B"
              options={PERIOD_OPTIONS}
              value={b}
              onChange={(option) => setB(option?.value ?? b)}
            />
          </div>
        </div>
        <div className="mb-5">
          {statsA &&
            statsB &&
            ROWS.map(({ key, label }) => {
              const av = statsA[key];
              const bv = statsB[key];
              const d = av - bv;
              const pct = bv ? Math.round((d / bv) * 100) : 0;
              const cls = d === 0 ? "c-dim2" : d > 0 ? "c-green" : "c-red";
              return (
                <div key={key} className="cmp-grid mb-2">
                  <div className="cmp-cell">
                    <div className="big">{fmtVal(key, av)}</div>
                    <div className="lbl">{label}</div>
                  </div>
                  <div className={`cmp-delta ${cls}`}>
                    {d > 0 ? "▲ +" : d < 0 ? "▼ " : ""}
                    {pct}%
                  </div>
                  <div className="cmp-cell">
                    <div className="big">{fmtVal(key, bv)}</div>
                    <div className="lbl">{label}</div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onExport}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCompareModal;
