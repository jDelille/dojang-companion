import { useState } from "react";
import {
  CalendarClock,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileOutput,
  FilePlus,
  HardDrive,
  MoreVertical,
  Percent,
  Printer,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { Report } from "../../types/reports";
import {
  PERIOD_NAMES,
  REPORT_CAT_META,
  SOURCES,
} from "../../utils/json/reportsData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import REPORT_CAT_ICON from "./reportIcons";
import useReports from "./useReports";
import ReportGenerateModal from "./modal/reportGenerateModal";
import ReportViewModal from "./modal/reportViewModal";
import ReportExportModal from "./modal/reportExportModal";
import ReportPrintModal from "./modal/reportPrintModal";
import ReportScheduleModal from "./modal/reportScheduleModal";
import ReportFilterModal from "./modal/reportFilterModal";
import ReportDeleteModal from "./modal/reportDeleteModal";

/*
   Reports — ported from tailwind/src/reports.html and assets/js/reports.js.
   Period-driven revenue/expense bars, a conic-gradient revenue-source donut,
   the report library and the full modal suite.
*/

const CAT_TABS = [
  { cat: "All", label: "All Reports", Icon: null },
  { cat: "Financial", label: "Financial", Icon: DollarSign },
  { cat: "Sales", label: "Sales", Icon: ShoppingCart },
  { cat: "Members", label: "Members", Icon: Users },
  { cat: "Operations", label: "Operations", Icon: Settings },
];

type ModalKind =
  | "generate"
  | "view"
  | "export"
  | "print"
  | "schedule"
  | "filter"
  | "delete";

const Reports = () => {
  const page = useReports();
  const { filtered, kpis, bars, donutGradient, period, cat, setCat, fmt, sort, search, setSearch } =
    page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const menuFor = (r: Report) => (
    <RowMenu
      triggerClassName="rep-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", r.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View / Preview
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => page.downloadReport(r.id)}
      >
        <Download className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Download
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("export", r.id)}>
        <FileOutput className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Export As…
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("print", r.id)}>
        <Printer className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Print
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("schedule", r.id)}>
        <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Schedule
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", r.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </RowMenu>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Reports</h2>
          <p className="text-sm mt-0.5 c-dim">Financial &amp; operational reports · Austin HQ</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="fp-input py-2 text-sm w-auto"
            value={period}
            onChange={(e) => page.setPeriod(e.target.value)}
          >
            {PERIOD_NAMES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("export", null)}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("schedule", null)}
          >
            <CalendarClock className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Schedule
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setModal("generate")}
          >
            <FilePlus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-green">
              <TrendingUp className="w-[16px] h-[16px] c-green shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Total Revenue</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.revenue}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-red">
              <TrendingDown className="w-[16px] h-[16px] c-red shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Total Expenses</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.expense}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-gold">
              <Wallet className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Net Profit</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black gt leading-none">{kpis.profit}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-cyan">
              <Percent className="w-[16px] h-[16px] c-cyan shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Profit Margin</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.margin}</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Revenue vs Expenses */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold c-text sec-title">Revenue vs Expenses</h3>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="legend-dot legend-rev" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="legend-dot legend-exp" />
                Expenses
              </span>
            </div>
          </div>
          <div className="rev-bars">
            {bars.map((bar) => (
              <div key={bar.label} className="rev-col">
                <div
                  className="rev-seg"
                  style={{
                    height: `${bar.revHeight}%`,
                    background: "linear-gradient(180deg,#4ADE80,#16A34A)",
                  }}
                  title={`Revenue ${bar.revLabel}`}
                />
                <div
                  className="rev-seg"
                  style={{
                    height: `${bar.expHeight}%`,
                    background: "linear-gradient(180deg,#F87171,#B91C1C)",
                  }}
                  title={`Expense ${bar.expLabel}`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] c-dim2 font-semibold px-1">
            {bars.map((bar) => (
              <span key={bar.label}>{bar.label}</span>
            ))}
          </div>
        </div>

        {/* Revenue breakdown donut */}
        <div className="glass-card p-5">
          <h3 className="font-bold c-text sec-title mb-4">Revenue Sources</h3>
          <div className="flex items-center gap-4">
            <div className="donut" style={{ background: donutGradient }} />
            <div className="flex-1 space-y-2.5">
              {SOURCES.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="legend-dot" style={{ background: s.color }} />
                  <span className="text-[12px] c-text2 flex-1">{s.label}</span>
                  <span className="text-[12px] font-bold c-text">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report library */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CAT_TABS.map(({ cat: value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={cat === value ? "ord-tab active" : "ord-tab"}
              onClick={() => setCat(value)}
            >
              {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-[180px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 py-2 text-sm"
              placeholder="Search reports…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setModal("filter")}
          >
            <SlidersHorizontal className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Filter
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5${filtered.length === 0 ? " hidden" : ""}`}
      >
        {filtered.map((r, index) => {
          const meta = REPORT_CAT_META[r.cat];
          const Icon = REPORT_CAT_ICON[r.cat];
          return (
            <div
              key={r.id}
              className="rep-card reveal"
              style={{ animationDelay: `${Math.min(index * 30, 360)}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`rep-ic ${meta.cls}`}>
                  <Icon
                    className="w-[20px] h-[20px] shrink-0"
                    style={{ color: meta.color }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold c-text">{r.name}</div>
                  <span className="type-pill" style={meta.pill}>
                    {r.cat}
                  </span>
                </div>
                <span className="rep-fmt">{r.fmt}</span>
                {menuFor(r)}
              </div>
              <p className="text-[12px] c-dim leading-relaxed mb-3">{r.desc}</p>
              <div className="flex items-center gap-3 text-[11px] c-dim2 mb-3">
                <span className="flex items-center gap-1">
                  <Clock
                    style={{ width: "11px", height: "11px" }}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  {r.updated}
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive
                    style={{ width: "11px", height: "11px" }}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  {r.size}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-3 bd-t">
                <button
                  type="button"
                  className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                  onClick={() => open("view", r.id)}
                >
                  <Eye className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                  Preview
                </button>
                <button
                  type="button"
                  className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                  onClick={() => page.downloadReport(r.id)}
                >
                  <Download className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`text-center py-16${filtered.length === 0 ? "" : " hidden"}`}>
        <div className="text-[42px] opacity-30 mb-2">📊</div>
        <div className="text-sm font-bold c-text">No reports found</div>
        <div className="text-xs mt-1 c-dim">Try a different category or search</div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <ReportGenerateModal
        key={`generate-${period}`}
        open={modal === "generate"}
        period={period}
        onClose={close}
        onConfirm={page.generateReport}
      />
      <ReportViewModal
        report={modal === "view" ? target : null}
        onClose={close}
        onPrint={() => setModal("print")}
        onExport={() => setModal("export")}
        onDownload={() => {
          if (targetId != null) page.downloadReport(targetId);
          close();
        }}
      />
      <ReportExportModal
        key={`export-${targetId ?? "all"}`}
        open={modal === "export"}
        report={modal === "export" ? target : null}
        onClose={close}
        onConfirm={(format) => page.confirmExport(targetId, format)}
      />
      <ReportPrintModal
        report={modal === "print" ? target : null}
        onClose={close}
        onConfirm={() => page.confirmPrint(targetId)}
      />
      <ReportScheduleModal
        key={`schedule-${targetId ?? "new"}`}
        open={modal === "schedule"}
        report={modal === "schedule" ? target : null}
        onClose={close}
        onConfirm={(email, freq) => page.confirmSchedule(targetId, email, freq)}
      />
      <ReportFilterModal
        key={`filter-${cat}-${fmt}-${sort}`}
        open={modal === "filter"}
        cat={cat}
        fmt={fmt}
        sort={sort}
        onClose={close}
        onApply={page.applyFilter}
        onReset={page.resetFilter}
      />
      <ReportDeleteModal
        report={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteReport}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Reports;
