import type { KpiRing, MonthlyGoal, PeriodStats } from "../../types/analytics";

/*
   Analytics seed data — ported verbatim from tailwind/src/assets/js/analytics.js
   (WEEKS, GOALS, RINGS, PERIOD_STATS, FORMATS).
*/

export const AN_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Weekly revenue per day, in dollars. */
export const WEEKS: Record<string, number[]> = {
  "This Week": [2800, 3800, 2100, 4600, 3300, 5100, 2300],
  "Last Week": [2400, 3100, 2600, 3600, 2900, 4200, 2000],
};

export const WEEK_OPTIONS = ["This Week", "Last Week"];

export const GOALS: MonthlyGoal[] = [
  {
    label: "Revenue Goal",
    value: 82,
    grad: "linear-gradient(90deg,#D4AF37,#F4D03F)",
    color: "#F4D03F",
  },
  {
    label: "New Members",
    value: 71,
    grad: "linear-gradient(90deg,#818CF8,#A78BFA)",
    color: "#818CF8",
  },
  {
    label: "Renewals",
    value: 78,
    grad: "linear-gradient(90deg,#FB923C,#FBBF24)",
    color: "#FB923C",
  },
  {
    label: "PT Sessions",
    value: 89,
    grad: "linear-gradient(90deg,#22D3EE,#38BDF8)",
    color: "#22D3EE",
  },
];

export const RINGS: KpiRing[] = [
  {
    label: "Capacity",
    value: 82,
    color: "#D4AF37",
    track: "rgba(212,175,55,0.08)",
    sub: "Today's peak",
    desc: "Peak floor occupancy against total capacity for today.",
  },
  {
    label: "Retention",
    value: 70,
    color: "#818CF8",
    track: "rgba(99,102,241,0.08)",
    sub: "3-month rate",
    desc: "Members still active after their first three months.",
  },
  {
    label: "Satisfaction",
    value: 89,
    color: "#FB923C",
    track: "rgba(249,115,22,0.08)",
    sub: "NPS score",
    desc: "Net promoter score from member feedback surveys.",
  },
  {
    label: "PT Uptake",
    value: 60,
    color: "#22D3EE",
    track: "rgba(34,211,238,0.08)",
    sub: "Members enrolled",
    desc: "Share of members enrolled in personal-training plans.",
  },
];

export const PERIOD_STATS: Record<string, PeriodStats> = {
  "This Week": { revenue: 24000, members: 38, retention: 70, satisfaction: 89 },
  "Last Week": { revenue: 20800, members: 31, retention: 68, satisfaction: 87 },
  "This Month": { revenue: 104000, members: 142, retention: 72, satisfaction: 88 },
  "Last Month": { revenue: 88000, members: 128, retention: 69, satisfaction: 86 },
  "This Quarter": { revenue: 298000, members: 401, retention: 71, satisfaction: 88 },
};

export const PERIODS = Object.keys(PERIOD_STATS);

export const AN_FORMATS = ["PDF", "XLSX", "CSV", "PNG"];

export const AN_SEGMENTS = ["All members", "Gold", "Monthly", "Quarterly", "Day pass"];

/** Ring circumference: 2πr with r = 42. */
export const RING_C = 264;
