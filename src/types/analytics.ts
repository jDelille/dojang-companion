/* Analytics types — ported from tailwind/src/assets/js/analytics.js */

export type MonthlyGoal = {
  label: string;
  value: number;
  grad: string;
  color: string;
};

export type KpiRing = {
  label: string;
  value: number;
  color: string;
  track: string;
  sub: string;
  desc: string;
};

export type PeriodStats = {
  revenue: number;
  members: number;
  retention: number;
  satisfaction: number;
};

/** Which panel the View / Export / Print modals are acting on. */
export type AnalyticsView = "weekly" | "goals" | "ring" | "all";
