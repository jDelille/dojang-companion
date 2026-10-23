import { Download, X } from "lucide-react";
import type { AnalyticsView } from "../../../types/analytics";
import { AN_DAYS, GOALS, RINGS } from "../../../utils/json/analyticsData";
import { usd } from "../../../utils/formatUtils";

/*
   View Details — ported from #modal-view in tailwind/src/analytics.html and
   openView() in assets/js/analytics.js. The body varies by which panel opened
   it: the weekly chart, the goals panel, or a single KPI ring.
*/

type AnalyticsViewModalProps = {
  open: boolean;
  view: AnalyticsView;
  /** Index into RINGS when `view` is "ring". */
  ringIndex: number;
  week: string;
  weekly: {
    data: number[];
    total: number;
    peak: number;
    max: number;
    bestDay: string;
    average: number;
  };
  onClose: () => void;
  onExport: () => void;
};

const AnalyticsViewModal = ({
  open,
  view,
  ringIndex,
  week,
  weekly,
  onClose,
  onExport,
}: AnalyticsViewModalProps) => {
  const ring = RINGS[ringIndex];

  const title =
    view === "weekly"
      ? "Weekly Revenue · " + week
      : view === "goals"
        ? "Monthly Goals"
        : view === "ring"
          ? (ring?.label ?? "Details")
          : "Details";

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
          <h3 className="text-base font-black c-text">{title}</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-5">
          {view === "weekly" && (
            <>
              <div className="detail-row">
                <span className="k">Total revenue</span>
                <span className="v gt">{usd(weekly.total)}</span>
              </div>
              <div className="detail-row">
                <span className="k">Best day</span>
                <span className="v">
                  {weekly.bestDay} · {usd(weekly.max)}
                </span>
              </div>
              <div className="detail-row">
                <span className="k">Daily average</span>
                <span className="v">{usd(weekly.average)}</span>
              </div>
              <table className="mini-tbl mt-3">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th className="num" style={{ textAlign: "right" }}>
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {weekly.data.map((value, d) => (
                    <tr key={AN_DAYS[d]}>
                      <td>{AN_DAYS[d]}</td>
                      <td className="num">${value.toLocaleString("en-US")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {view === "goals" &&
            GOALS.map((g) => (
              <div key={g.label} className="detail-row">
                <span className="k">{g.label}</span>
                <span className="v" style={{ color: g.color }}>
                  {g.value}% achieved
                </span>
              </div>
            ))}

          {view === "ring" && ring && (
            <>
              <div className="text-center mb-4">
                <div className="text-4xl font-black" style={{ color: ring.color }}>
                  {ring.value}%
                </div>
                <div className="text-[12px] c-dim mt-1">{ring.sub}</div>
              </div>
              <p className="text-sm c-text2 leading-relaxed">{ring.desc}</p>
            </>
          )}
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

export default AnalyticsViewModal;
