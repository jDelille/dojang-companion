import { useState } from "react";
import {
  CalendarRange,
  Download,
  Eye,
  GitCompare,
  MoreVertical,
  Printer,
  SlidersHorizontal,
} from "lucide-react";
import type { AnalyticsView } from "../../types/analytics";
import { GOALS, PERIODS, RINGS, RING_C, WEEK_OPTIONS } from "../../utils/json/analyticsData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import useAnalytics from "./useAnalytics";
import AnalyticsViewModal from "./modal/analyticsViewModal";
import AnalyticsExportModal from "./modal/analyticsExportModal";
import AnalyticsPrintModal from "./modal/analyticsPrintModal";
import AnalyticsFilterModal from "./modal/analyticsFilterModal";
import AnalyticsDateRangeModal from "./modal/analyticsDateRangeModal";
import AnalyticsCompareModal from "./modal/analyticsCompareModal";

/*
   Analytics — ported from tailwind/src/analytics.html and assets/js/analytics.js.
   Weekly-revenue bars, monthly goals, radial KPI rings and the full modal suite.

   The rings are inline SVG (stroke-dasharray arcs), exactly as the template
   drew them — no chart library is involved anywhere on this page.
*/

type ModalKind = "view" | "export" | "print" | "filter" | "daterange" | "compare";

const Analytics = () => {
  const page = useAnalytics();
  const { weekly, period, setPeriod, week, setWeek, subtitle } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  /** Which panel the View/Export/Print modals are acting on. */
  const [view, setView] = useState<AnalyticsView>("all");
  const [ringIndex, setRingIndex] = useState(0);

  const close = () => setModal(null);

  const openFor = (kind: ModalKind, which: AnalyticsView, index = 0) => {
    setView(which);
    setRingIndex(index);
    setModal(kind);
  };

  /* Panel overflow menu — View Details / Export / Print, as menuItems() built. */
  const menuFor = (kind: AnalyticsView) => (
    <RowMenu
      triggerClassName="an-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => openFor("view", kind)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => openFor("export", kind)}>
        <Download className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Export
      </button>
      <button type="button" className="dropdown-item" onClick={() => openFor("print", kind)}>
        <Printer className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Print
      </button>
    </RowMenu>
  );

  return (
    <>
      <div id="section-analytics" className="section active-section">
        {/* Page header */}
        <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black c-text">Analytics</h2>
            <p className="text-sm mt-0.5 c-dim">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="fp-input py-2 text-sm w-auto"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIODS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
              onClick={() => setModal("daterange")}
            >
              <CalendarRange className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Date Range
            </button>
            <button
              type="button"
              className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
              onClick={() => setModal("filter")}
            >
              <SlidersHorizontal className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Filter
            </button>
            <button
              type="button"
              className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
              onClick={() => setModal("compare")}
            >
              <GitCompare className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Compare
            </button>
            <button
              type="button"
              className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
              onClick={() => openFor("print", "all")}
            >
              <Printer className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Print
            </button>
            <button
              type="button"
              className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
              onClick={() => openFor("export", "all")}
            >
              <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Weekly Revenue */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold c-text">Weekly Revenue</h3>
                <span className="text-sm font-black gt">{weekly.totalLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="fp-input py-1.5 text-xs w-auto"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                >
                  {WEEK_OPTIONS.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                {menuFor("weekly")}
              </div>
            </div>
            <div className="an-bars">
              {weekly.bars.map((bar) => (
                <div key={bar.day} className="an-bar-col">
                  <span className="an-val">{bar.label}</span>
                  <div
                    className={bar.isPeak ? "an-bar peak" : "an-bar"}
                    style={{ height: `${bar.height}%` }}
                  />
                  <span className="an-day">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Goals */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold c-text">Monthly Goals</h3>
              {menuFor("goals")}
            </div>
            <div className="flex flex-col gap-4">
              {GOALS.map((g) => (
                <div key={g.label} className="goal-row">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="c-text2">{g.label}</span>
                    <span className="font-bold" style={{ color: g.color }}>
                      {g.value}%
                    </span>
                  </div>
                  <div className="prog-track">
                    <div
                      className="prog-bar-2"
                      style={{ width: `${g.value}%`, background: g.grad }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radial KPI rings */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {RINGS.map((ring, index) => {
            const offset = Math.round(RING_C * (1 - ring.value / 100));
            return (
              <div
                key={ring.label}
                className="sc-finance-ring ring-card text-center"
                role="button"
                tabIndex={0}
                onClick={() => openFor("view", "ring", index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openFor("view", "ring", index);
                }}
              >
                <div className="ring-wrap">
                  <svg viewBox="0 0 100 100" className="ring-svg">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={ring.track}
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="8"
                      strokeDasharray={RING_C}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="ring-num" style={{ color: ring.color }}>
                    {ring.value}%
                  </div>
                </div>
                <div className="text-sm font-semibold text-white">{ring.label}</div>
                <div className="text-[11px] mt-0.5 c-dim">{ring.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <AnalyticsViewModal
        open={modal === "view"}
        view={view}
        ringIndex={ringIndex}
        week={week}
        weekly={weekly}
        onClose={close}
        onExport={() => setModal("export")}
      />
      <AnalyticsExportModal
        key={`export-${view}-${period}`}
        open={modal === "export"}
        view={view}
        period={period}
        onClose={close}
        onConfirm={page.confirmExport}
      />
      <AnalyticsPrintModal
        open={modal === "print"}
        view={view}
        onClose={close}
        onConfirm={page.confirmPrint}
      />
      <AnalyticsFilterModal
        open={modal === "filter"}
        onClose={close}
        onApply={page.applyFilter}
      />
      <AnalyticsDateRangeModal
        open={modal === "daterange"}
        onClose={close}
        onApply={page.applyDateRange}
      />
      <AnalyticsCompareModal
        open={modal === "compare"}
        onClose={close}
        onExport={() => openFor("export", "all")}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Analytics;
