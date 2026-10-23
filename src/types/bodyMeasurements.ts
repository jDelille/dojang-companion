/* Body Measurements types — ported from tailwind/src/assets/js/body-measurements.js */

export type MeasureLog = {
  id: number;
  /** Display string, e.g. "Jul 14, 2026". */
  date: string;
  weight: number;
  bmi: number;
  fat: number;
  muscle: number;
};

export type BodyPart = {
  part: string;
  val: number;
  start: number;
  unit: string;
};

/** Fields the Log / Edit Measurement modal collects. BMI is derived from weight. */
export type MeasureFormValues = {
  date: Date | null;
  weight: number;
  fat: number;
  muscle: number;
};

/** One computed point of the SVG weight-trend chart. */
export type ChartPoint = {
  x: number;
  y: number;
  label: string;
  value: number;
};

export type ChartGridLine = {
  y: number;
  label: string;
};
