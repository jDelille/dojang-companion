import type { BodyPart, MeasureLog } from "../../types/bodyMeasurements";

/*
   Body Measurements seed data — ported verbatim from tailwind/src/assets/js/
   body-measurements.js (WEIGHT_12, MONTHS_12, MEASURES, LOG).
*/

/** Reference height in inches (5'5") used for the BMI formula. */
export const HEIGHT_IN = 65;

/** Weight history in lbs, most recent last. */
export const WEIGHT_12 = [
  145.6, 143.9, 142.6, 142.8, 141.0, 139.7, 140.4, 138.6, 137.7, 137.3, 136.8, 136.4,
];

export const MONTHS_12 = [
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
];

export const MEASURES: BodyPart[] = [
  { part: "Chest", val: 36.2, start: 37.8, unit: "in" },
  { part: "Waist", val: 29.1, start: 32.3, unit: "in" },
  { part: "Hips", val: 37.8, start: 39.4, unit: "in" },
  { part: "Arms", val: 11.8, start: 11.0, unit: "in" },
  { part: "Thighs", val: 21.3, start: 22.4, unit: "in" },
];

/** Log entries, newest first — the id sequence follows L(). */
export const MEASURE_LOG: MeasureLog[] = [
  { id: 1, date: "Jul 14, 2026", weight: 136.4, bmi: 22.7, fat: 24.5, muscle: 90.6 },
  { id: 2, date: "Jun 14, 2026", weight: 137.7, bmi: 22.9, fat: 25.4, muscle: 89.3 },
  { id: 3, date: "May 14, 2026", weight: 139.7, bmi: 23.2, fat: 26.1, muscle: 87.6 },
  { id: 4, date: "Apr 14, 2026", weight: 141.0, bmi: 23.5, fat: 26.8, muscle: 86.5 },
  { id: 5, date: "Mar 14, 2026", weight: 142.6, bmi: 23.7, fat: 27.2, muscle: 85.6 },
  { id: 6, date: "Feb 14, 2026", weight: 145.6, bmi: 24.2, fat: 27.6, muscle: 85.4 },
];

export const BM_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Tyler Brooks",
  "Megan Sullivan",
];

/** Chart geometry, matching renderChart()'s fixed 620×220 viewBox. */
export const CHART = {
  W: 620,
  H: 220,
  padL: 34,
  padR: 12,
  padT: 16,
  padB: 26,
};
