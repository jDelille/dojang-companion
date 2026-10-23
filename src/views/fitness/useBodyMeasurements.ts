import { useCallback, useMemo, useState } from "react";
import type {
  ChartGridLine,
  ChartPoint,
  MeasureFormValues,
  MeasureLog,
} from "../../types/bodyMeasurements";
import {
  CHART,
  HEIGHT_IN,
  MEASURE_LOG,
  MEASURES,
  MONTHS_12,
  WEIGHT_12,
} from "../../utils/json/bodyMeasurementsData";
import useToast from "../../hooks/useToast";

/*
   Body Measurements state — ported from tailwind/src/assets/js/body-measurements.js.
   Owns the chart range, the log entries and the derived metric deltas, chart
   geometry and measurement bars.
*/

export const bmiOf = (weight: number) =>
  Number(((703 * weight) / (HEIGHT_IN * HEIGHT_IN)).toFixed(1));

/** Delta classes used by the metric cards; `goodDown` inverts what counts as good. */
export const deltaClass = (diff: number, goodDown: boolean) => {
  if (Math.abs(diff) < 0.05) return "delta delta-flat";
  const good = goodDown ? diff < 0 : diff > 0;
  return good ? "delta delta-down" : "delta delta-up";
};

/** "Jul 14, 2026" — the format fmtDate() produced. */
export const fmtDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "Jul 14, 2026";

export function useBodyMeasurements() {
  const { message, visible, showToast } = useToast();

  const [log, setLog] = useState<MeasureLog[]>(MEASURE_LOG);
  const [weights, setWeights] = useState<number[]>(WEIGHT_12);
  const [range, setRange] = useState(6);
  const [member, setMember] = useState("Ashley Bennett");

  const find = useCallback((id: number) => log.find((l) => l.id === id) ?? null, [log]);

  /** Current entry plus the one before it, driving the four metric cards. */
  const metrics = useMemo(() => {
    if (!log.length) return null;
    const cur = log[0];
    const prev = log[1] ?? log[0];
    return {
      cur,
      dWeight: cur.weight - prev.weight,
      dBmi: cur.bmi - prev.bmi,
      dFat: cur.fat - prev.fat,
      dMuscle: cur.muscle - prev.muscle,
    };
  }, [log]);

  /*
     SVG weight-trend chart — a direct port of renderChart(). Returns the
     computed geometry so the page can render <polygon>/<polyline>/<circle>
     instead of writing an innerHTML string.
  */
  const chart = useMemo(() => {
    const data = weights.slice(-range);
    const labels = MONTHS_12.slice(-range);
    const { W, H, padL, padR, padT, padB } = CHART;

    const min = Math.min(...data) - 1;
    const max = Math.max(...data) + 1;
    const x = (i: number) => padL + (i * (W - padL - padR)) / (data.length - 1);
    const y = (v: number) => padT + (H - padT - padB) * (1 - (v - min) / (max - min));

    const grid: ChartGridLine[] = [];
    for (let g = 0; g <= 4; g++) {
      grid.push({
        y: padT + ((H - padT - padB) * g) / 4,
        label: (max - ((max - min) * g) / 4).toFixed(0),
      });
    }

    const points: ChartPoint[] = data.map((value, i) => ({
      x: x(i),
      y: y(value),
      label: labels[i],
      value,
    }));

    const linePts = points.map((p) => `${p.x},${p.y}`).join(" ");
    const areaPts = `${padL},${H - padB} ${linePts} ${W - padR},${H - padB}`;

    return { grid, points, linePts, areaPts };
  }, [weights, range]);

  /*
     Measurement bars. Arms is inverted: growing is good there, shrinking is
     good everywhere else — the `cls` branch in renderMeasures().
  */
  const measures = useMemo(
    () =>
      MEASURES.map((m) => {
        const diff = m.val - m.start;
        const up = diff > 0;
        const flat = diff === 0;
        const cls =
          m.part === "Arms"
            ? up
              ? "delta-down"
              : "delta-up"
            : up
              ? "delta-up"
              : "delta-down";
        return {
          ...m,
          diff,
          flat,
          cls: flat ? "delta-flat" : cls,
          pct: Math.min(100, Math.round((m.val / (m.start * 1.2)) * 100)),
        };
      }),
    [],
  );

  /* ---------- Mutations ---------- */

  const saveEntry = useCallback(
    (values: MeasureFormValues, editId: number | null) => {
      const weight = Number(values.weight);
      if (!weight) {
        showToast("Enter a weight");
        return false;
      }

      const data = {
        date: fmtDate(values.date),
        weight,
        bmi: bmiOf(weight),
        fat: Number(values.fat) || 0,
        muscle: Number(values.muscle) || 0,
      };

      if (editId != null) {
        setLog((prev) => prev.map((l) => (l.id === editId ? { ...l, ...data } : l)));
        showToast("Entry updated");
      } else {
        setLog((prev) => [
          { ...data, id: prev.reduce((max, l) => Math.max(max, l.id), 0) + 1 },
          ...prev,
        ]);
        /* New entries push onto the 12-point trend, dropping the oldest. */
        setWeights((prev) => [...prev, weight].slice(-12));
        showToast("Measurement logged");
      }
      return true;
    },
    [showToast],
  );

  const deleteEntry = useCallback(
    (id: number) => {
      setLog((prev) => prev.filter((l) => l.id !== id));
      showToast("Entry deleted");
    },
    [showToast],
  );

  /** Compare needs two entries; the template toasts and stays closed otherwise. */
  const canCompare = useCallback(() => {
    if (log.length < 2) {
      showToast("Need at least two entries to compare");
      return false;
    }
    return true;
  }, [log.length, showToast]);

  const selectMember = useCallback(
    (name: string) => {
      setMember(name);
      showToast("Viewing " + name + "'s progress");
    },
    [showToast],
  );

  const exportReport = useCallback(
    () => showToast("Progress report exported"),
    [showToast],
  );

  return {
    log,
    metrics,
    chart,
    measures,
    range,
    setRange,
    member,
    selectMember,
    find,
    saveEntry,
    deleteEntry,
    canCompare,
    exportReport,
    toast: { message, visible },
  };
}

export default useBodyMeasurements;
