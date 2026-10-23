import type {
  PeriodSeries,
  Report,
  ReportCategory,
  RevenueSource,
} from "../../types/reports";

/*
   Reports seed data — ported verbatim from tailwind/src/assets/js/reports.js
   (PERIODS, SOURCES, CAT_META, REPORTS, FORMATS, FREQS). Ids follow the R()
   1-based sequence.
*/

export const REPORT_PERIODS: Record<string, PeriodSeries> = {
  "This Month": {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    rev: [62000, 68000, 71000, 76000, 80000, 84000],
    exp: [41000, 44000, 42000, 48000, 46000, 49000],
  },
  "Last Month": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    rev: [58000, 62000, 68000, 71000, 76000, 80000],
    exp: [39000, 41000, 44000, 42000, 48000, 46000],
  },
  "This Quarter": {
    labels: ["May", "Jun", "Jul"],
    rev: [76000, 80000, 84000],
    exp: [48000, 46000, 49000],
  },
  "This Year": {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    rev: [50000, 54000, 56000, 60000, 64000, 58000, 62000, 68000, 71000, 76000, 80000, 84000],
    exp: [34000, 36000, 38000, 40000, 42000, 39000, 41000, 44000, 42000, 48000, 46000, 49000],
  },
};

export const PERIOD_NAMES = Object.keys(REPORT_PERIODS);

export const SOURCES: RevenueSource[] = [
  { label: "Memberships", value: 52, color: "#D4AF37" },
  { label: "POS Sales", value: 24, color: "#818CF8" },
  { label: "PT Sessions", value: 16, color: "#22D3EE" },
  { label: "Classes", value: 8, color: "#FB923C" },
];

/** `pill` is applied as an inline style string, exactly as in the template. */
export const REPORT_CAT_META: Record<
  ReportCategory,
  { color: string; cls: string; pill: { background: string; color: string } }
> = {
  Financial: {
    color: "#D4AF37",
    cls: "ic-gold",
    pill: { background: "rgba(212,175,55,0.12)", color: "#D4AF37" },
  },
  Sales: {
    color: "#818CF8",
    cls: "ic-purple",
    pill: { background: "rgba(129,140,248,0.12)", color: "#818CF8" },
  },
  Members: {
    color: "#4ADE80",
    cls: "ic-green",
    pill: { background: "rgba(74,222,128,0.12)", color: "#4ADE80" },
  },
  Operations: {
    color: "#22D3EE",
    cls: "ic-cyan",
    pill: { background: "rgba(34,211,238,0.12)", color: "#22D3EE" },
  },
};

export const REPORT_CATS = Object.keys(REPORT_CAT_META) as ReportCategory[];

export const REPORT_FORMATS = ["PDF", "XLSX", "CSV"];

export const REPORT_FREQS = ["Daily", "Weekly", "Monthly", "Quarterly"];

export const GENERATE_TYPES = [
  "Profit & Loss",
  "Sales Summary",
  "Membership Growth",
  "Attendance",
  "Inventory Valuation",
  "Custom",
];

export const REPORTS: Report[] = [
  { id: 1, name: "Profit & Loss Statement", cat: "Financial", desc: "Full P&L with revenue, costs & net profit", updated: "Jul 14, 2026", size: "2.4 MB", fmt: "PDF" },
  { id: 2, name: "Balance Sheet", cat: "Financial", desc: "Assets, liabilities & equity snapshot", updated: "Jul 13, 2026", size: "1.1 MB", fmt: "PDF" },
  { id: 3, name: "Cash Flow Report", cat: "Financial", desc: "Inflows & outflows across the month", updated: "Jul 14, 2026", size: "860 KB", fmt: "XLSX" },
  { id: 4, name: "Sales Tax Summary", cat: "Financial", desc: "Tax collected & payable breakdown", updated: "Jul 10, 2026", size: "540 KB", fmt: "PDF" },
  { id: 5, name: "Daily Sales Report", cat: "Sales", desc: "Order & revenue totals by day", updated: "Jul 14, 2026", size: "1.8 MB", fmt: "XLSX" },
  { id: 6, name: "Product Performance", cat: "Sales", desc: "Top sellers, margins & stock turnover", updated: "Jul 12, 2026", size: "2.0 MB", fmt: "PDF" },
  { id: 7, name: "Refunds & Returns", cat: "Sales", desc: "Refund volume & reasons", updated: "Jul 11, 2026", size: "420 KB", fmt: "PDF" },
  { id: 8, name: "Membership Growth", cat: "Members", desc: "New joins, renewals & churn trend", updated: "Jul 14, 2026", size: "1.3 MB", fmt: "PDF" },
  { id: 9, name: "Attendance Report", cat: "Members", desc: "Check-in frequency & peak hours", updated: "Jul 13, 2026", size: "980 KB", fmt: "XLSX" },
  { id: 10, name: "Retention Analysis", cat: "Members", desc: "Active vs lapsed members over time", updated: "Jul 09, 2026", size: "1.5 MB", fmt: "PDF" },
  { id: 11, name: "Trainer Utilisation", cat: "Operations", desc: "Sessions delivered per trainer", updated: "Jul 13, 2026", size: "720 KB", fmt: "XLSX" },
  { id: 12, name: "Inventory Valuation", cat: "Operations", desc: "Stock value & reorder status", updated: "Jul 14, 2026", size: "1.2 MB", fmt: "PDF" },
];
