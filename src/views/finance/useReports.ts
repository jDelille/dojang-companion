import { useCallback, useMemo, useState } from "react";
import type { GenerateValues, Report, ReportSort } from "../../types/reports";
import {
  REPORTS,
  REPORT_PERIODS,
  SOURCES,
} from "../../utils/json/reportsData";
import { usd } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Reports state — ported from tailwind/src/assets/js/reports.js. Owns the
   period, category tab, format filter, sort and search, and derives the summary
   KPIs, the revenue-vs-expense bars, the source donut and the report library.
*/

export function useReports() {
  const { message, visible, showToast } = useToast();

  const [reports, setReports] = useState<Report[]>(REPORTS);
  const [period, setPeriodState] = useState("This Month");
  const [cat, setCat] = useState("All");
  const [fmt, setFmt] = useState("All");
  const [sort, setSort] = useState<ReportSort>("recent");
  const [search, setSearch] = useState("");

  const find = useCallback((id: number) => reports.find((r) => r.id === id) ?? null, [reports]);

  const series = REPORT_PERIODS[period] ?? REPORT_PERIODS["This Month"];

  /** KPIs read the latest month of the selected period. */
  const kpis = useMemo(() => {
    const rev = series.rev[series.rev.length - 1];
    const exp = series.exp[series.exp.length - 1];
    const profit = rev - exp;
    return {
      revenue: usd(rev),
      expense: usd(exp),
      profit: usd(profit),
      margin: (rev ? (profit / rev) * 100 : 0).toFixed(1) + "%",
    };
  }, [series]);

  /** Paired revenue/expense bars, each scaled against the period's overall max. */
  const bars = useMemo(() => {
    const max = Math.max(...series.rev, ...series.exp) || 1;
    return series.labels.map((label, i) => ({
      label,
      revHeight: Math.round((series.rev[i] / max) * 100),
      expHeight: Math.round((series.exp[i] / max) * 100),
      revLabel: usd(series.rev[i]),
      expLabel: usd(series.exp[i]),
    }));
  }, [series]);

  /*
     Conic-gradient stops for the revenue-source donut. Each slice starts where
     the previous one ended, so the offset is the running sum of the preceding
     values rather than a mutable accumulator.
  */
  const donutGradient = useMemo(() => {
    const stops = SOURCES.map((s, i) => {
      const start = SOURCES.slice(0, i).reduce((sum, prev) => sum + prev.value, 0);
      const end = start + s.value;
      return `${s.color} ${start * 3.6}deg ${end * 3.6}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = reports.filter((r) => {
      const mq = !q || r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
      const mc = cat === "All" || r.cat === cat;
      const mf = fmt === "All" || r.fmt === fmt;
      return mq && mc && mf;
    });
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "category") list.sort((a, b) => a.cat.localeCompare(b.cat));
    return list;
  }, [reports, cat, fmt, sort, search]);

  const setPeriod = useCallback(
    (next: string) => {
      setPeriodState(next);
      showToast("Period: " + next);
    },
    [showToast],
  );

  /* ---------- Mutations ---------- */

  const generateReport = useCallback(
    (values: GenerateValues) => {
      const name = values.type === "Custom" ? "Custom Report" : values.type + " Report";
      setReports((prev) => [
        {
          id: prev.reduce((max, r) => Math.max(max, r.id), 0) + 1,
          name,
          cat: values.cat,
          desc:
            "Generated for " + values.period + (values.withCharts ? " · with charts" : ""),
          updated: "Jul 14, 2026",
          size: "—",
          fmt: values.fmt,
        },
        ...prev,
      ]);
      showToast('"' + name + '" generated');
    },
    [showToast],
  );

  const downloadReport = useCallback(
    (id: number) => {
      const r = find(id);
      if (r) showToast('Downloading "' + r.name + '" (' + r.fmt + ")");
    },
    [find, showToast],
  );

  /** A null id means the whole current view rather than one report. */
  const confirmExport = useCallback(
    (id: number | null, format: string) => {
      const r = id != null ? find(id) : null;
      showToast((r ? '"' + r.name + '"' : "Reports") + " exported as " + format);
    },
    [find, showToast],
  );

  const confirmPrint = useCallback(
    (id: number | null) => {
      const r = id != null ? find(id) : null;
      showToast((r ? '"' + r.name + '"' : "Report") + " sent to printer");
    },
    [find, showToast],
  );

  const confirmSchedule = useCallback(
    (id: number | null, email: string, freq: string) => {
      if (!email.trim()) {
        showToast("Enter a recipient email");
        return false;
      }
      const r = id != null ? find(id) : null;
      showToast((r ? '"' + r.name + '"' : "Report") + " scheduled · " + freq);
      return true;
    },
    [find, showToast],
  );

  const applyFilter = useCallback(
    (nextCat: string, nextFmt: string, nextSort: ReportSort) => {
      setCat(nextCat);
      setFmt(nextFmt);
      setSort(nextSort);
      showToast("Filters applied");
    },
    [showToast],
  );

  const resetFilter = useCallback(() => {
    setCat("All");
    setFmt("All");
    setSort("recent");
    setSearch("");
    showToast("Filters reset");
  }, [showToast]);

  const deleteReport = useCallback(
    (id: number) => {
      const r = find(id);
      setReports((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (r?.name ?? "Report") + '" deleted');
    },
    [find, showToast],
  );

  return {
    reports,
    filtered,
    kpis,
    bars,
    donutGradient,
    period,
    setPeriod,
    cat,
    setCat,
    fmt,
    sort,
    search,
    setSearch,
    find,
    generateReport,
    downloadReport,
    confirmExport,
    confirmPrint,
    confirmSchedule,
    applyFilter,
    resetFilter,
    deleteReport,
    toast: { message, visible },
  };
}

export default useReports;
