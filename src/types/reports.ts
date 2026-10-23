/* Reports types — ported from tailwind/src/assets/js/reports.js */

export type ReportCategory = "Financial" | "Sales" | "Members" | "Operations";

export type ReportFormat = "PDF" | "XLSX" | "CSV";

export type Report = {
  id: number;
  name: string;
  cat: ReportCategory;
  desc: string;
  updated: string;
  /** Human-readable file size, or "—" for a freshly generated report. */
  size: string;
  fmt: string;
};

export type PeriodSeries = {
  labels: string[];
  rev: number[];
  exp: number[];
};

export type RevenueSource = {
  label: string;
  value: number;
  color: string;
};

export type ReportSort = "recent" | "name" | "category";

/** Fields the Generate Report modal collects. */
export type GenerateValues = {
  type: string;
  cat: ReportCategory;
  fmt: string;
  period: string;
  withCharts: boolean;
};
