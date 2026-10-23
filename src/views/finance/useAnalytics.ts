import { useCallback, useMemo, useState } from "react";
import { AN_DAYS, PERIODS, WEEKS } from "../../utils/json/analyticsData";
import { usd } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Analytics state — ported from tailwind/src/assets/js/analytics.js.
   Owns the period + week selectors and the subtitle, and derives the weekly
   revenue bars. Goals and rings are static, so they stay in the data module.
*/

/** "2026-07-01" → "Jul 01", matching fmt(). */
export const fmtRangeDate = (date: Date | null) =>
  date ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "";

export function useAnalytics() {
  const { message, visible, showToast } = useToast();

  const [period, setPeriodState] = useState(PERIODS[0]);
  const [week, setWeek] = useState("This Week");
  const [subtitle, setSubtitle] = useState("Performance insights and KPIs · This Week");

  /** Bar heights are relative to the week's own peak, which gets the accent. */
  const weekly = useMemo(() => {
    const data = WEEKS[week] ?? WEEKS["This Week"];
    const max = Math.max(...data) || 1;
    const peak = data.indexOf(max);
    const total = data.reduce((s, v) => s + v, 0);
    return {
      data,
      max,
      peak,
      total,
      totalLabel: usd(total),
      bars: data.map((value, i) => ({
        value,
        label: usd(value),
        day: AN_DAYS[i],
        height: Math.round((value / max) * 100),
        isPeak: i === peak,
      })),
      bestDay: AN_DAYS[peak],
      average: Math.round(total / data.length),
    };
  }, [week]);

  const setPeriod = useCallback(
    (next: string) => {
      setPeriodState(next);
      setSubtitle("Performance insights and KPIs · " + next);
      showToast("Range: " + next);
    },
    [showToast],
  );

  const applyDateRange = useCallback(
    (from: Date | null, to: Date | null) => {
      if (!from || !to) {
        showToast("Pick both dates");
        return false;
      }
      setSubtitle(
        "Performance insights · " + fmtRangeDate(from) + " – " + fmtRangeDate(to),
      );
      showToast("Date range applied");
      return true;
    },
    [showToast],
  );

  const applyFilter = useCallback(
    (metricCount: number, segment: string) =>
      showToast(
        metricCount + " metric" + (metricCount === 1 ? "" : "s") + " · " + segment,
      ),
    [showToast],
  );

  const confirmExport = useCallback(
    (format: string) => showToast("Analytics exported as " + format),
    [showToast],
  );

  const confirmPrint = useCallback(() => showToast("Sent to printer"), [showToast]);

  return {
    period,
    setPeriod,
    week,
    setWeek,
    subtitle,
    weekly,
    applyDateRange,
    applyFilter,
    confirmExport,
    confirmPrint,
    toast: { message, visible },
  };
}

export default useAnalytics;
