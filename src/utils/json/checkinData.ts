import type {
  CheckinMember,
  LogStatus,
  MembershipState,
  TrafficHour,
} from "../../types/checkin";


export const MEMBER_STATE_BADGE: Record<MembershipState, string> = {
  active: "badge-active",
  expiring: "badge-pending",
  expired: "badge-expired",
};

export const MEMBER_STATE_LABEL: Record<MembershipState, string> = {
  active: "Active",
  expiring: "Expiring",
  expired: "Expired",
};

/** Badge per plan shown in the log; "Expired" marks a denied entry. */
export const PLAN_BADGE: Record<string, string> = {
  "Annual Premium": "badge-active",
  "Quarterly Gold": "badge-active",
  "Student Plan": "badge-active",
  "Monthly Standard": "badge-pending",
  Expired: "badge-expired",
};

export const LOG_STATUS_BADGE: Record<LogStatus, string> = {
  "In Gym": "badge-active",
  Expiring: "badge-pending",
  Denied: "badge-expired",
  "Checked Out": "badge-inactive",
};

/** Compact plan label used in the log's Plan column. */
export const planShort = (plan: string): string =>
  ({
    "Annual Premium": "Annual",
    "Quarterly Gold": "Quarterly",
    "Monthly Standard": "Monthly",
    "Student Plan": "Student",
  })[plan] ?? plan;

export const LOG_FILTERS: ("All" | LogStatus)[] = [
  "All",
  "In Gym",
  "Expiring",
  "Denied",
  "Checked Out",
];

export const TRAINER_OPTIONS = [
  "Unassigned",
  "Daniel Foster",
  "Andre Jackson",
  "Rachel Morgan",
  "Cameron Boyd",
];

/** The Edit modal offers two extra trainers the Manual modal does not. */
export const EDIT_TRAINER_OPTIONS = [
  ...TRAINER_OPTIONS,
  "Hannah Pierce",
  "Lauren Hayes",
];

export const LOG_STATUS_OPTIONS: LogStatus[] = [
  "In Gym",
  "Expiring",
  "Denied",
  "Checked Out",
];

/** Gym capacity used by the ring gauge. */
export const CAPACITY_MAX = 250;

/** Circumference of the capacity ring's arc, for stroke-dashoffset. */
export const CAPACITY_ARC = 264;

export const INITIAL_INSIDE = 147;

/** Headline figures fixed in the template's KPI strip. */
export const CHECKIN_KPIS = {
  checkinsToday: 213,
  peakHour: "6:30 PM",
  expiredDenied: 3,
};

/** Fixed clock — the template has no live Date in this page context. */
export const NOW_TIME = "9:20 AM";

/** Rows of the per-member history modal (UI-only demo data). */
export const CHECKIN_HISTORY = [
  { d: "Yesterday", t: "7:42 AM", dur: "1h 50m" },
  { d: "2 days ago", t: "6:15 PM", dur: "1h 12m" },
  { d: "3 days ago", t: "8:05 AM", dur: "2h 04m" },
  { d: "5 days ago", t: "7:20 AM", dur: "1h 35m" },
  { d: "6 days ago", t: "6:48 PM", dur: "55m" },
];

export const TRAFFIC: TrafficHour[] = [
  { h: "5", pct: 20 },
  { h: "6", pct: 35 },
  { h: "7", pct: 55 },
  { h: "8", pct: 70 },
  { h: "9", pct: 85 },
  { h: "10", pct: 100, peak: true },
  { h: "11", pct: 65 },
  { h: "12", pct: 40 },
  { h: "17", pct: 75 },
  { h: "18", pct: 90 },
  { h: "19", pct: 80 },
  { h: "20", pct: 45 },
];

export const CHECKIN_MEMBERS: CheckinMember[] = [
  { initials: "AB", name: "Ashley Bennett", plan: "Annual Premium", phone: "(512) 555-0142", mid: "M-1001", status: "active", tint: "av-gold-t" },
  { initials: "MC", name: "Marcus Coleman", plan: "Monthly Standard", phone: "(213) 555-0176", mid: "M-1002", status: "expiring", tint: "av-purple-t" },
  { initials: "JR", name: "Jessica Ramirez", plan: "Quarterly Gold", phone: "(415) 555-0133", mid: "M-1003", status: "active", tint: "av-orange-t" },
  { initials: "GW", name: "Grant Whitfield", plan: "Student Plan", phone: "(303) 555-0164", mid: "M-1004", status: "expired", tint: "av-cyan-t" },
  { initials: "BC", name: "Brooke Carter", plan: "Annual Premium", phone: "(213) 555-0101", mid: "M-1005", status: "active", tint: "av-red-t" },
  { initials: "CN", name: "Chloe Nguyen", plan: "Student Plan", phone: "(512) 555-0100", mid: "M-1006", status: "active", tint: "av-pink-t" },
];

/*
   Seed log rows. The template built these through L(), which assigned ids
   from a counter starting at 101 and copied the member's initials/tint.
*/
export const CHECKIN_LOG = [
  { id: 101, initials: "AB", tint: "av-gold-t", name: "Ashley Bennett", plan: "Annual Premium", time: "9:14 AM", status: "In Gym" as LogStatus, trainer: "Daniel Foster", locker: "#A-12", notes: "—" },
  { id: 102, initials: "MC", tint: "av-purple-t", name: "Marcus Coleman", plan: "Monthly Standard", time: "9:02 AM", status: "Expiring" as LogStatus, trainer: "Andre Jackson", locker: "#B-08", notes: "Renew due" },
  { id: 103, initials: "JR", tint: "av-orange-t", name: "Jessica Ramirez", plan: "Quarterly Gold", time: "8:55 AM", status: "In Gym" as LogStatus, trainer: "Rachel Morgan", locker: "#A-15", notes: "—" },
  { id: 104, initials: "GW", tint: "av-cyan-t", name: "Grant Whitfield", plan: "Expired", time: "8:48 AM", status: "Denied" as LogStatus, trainer: "—", locker: "—", notes: "Expired Jun 30" },
  { id: 105, initials: "BC", tint: "av-red-t", name: "Brooke Carter", plan: "Annual Premium", time: "8:41 AM", status: "In Gym" as LogStatus, trainer: "Hannah Pierce", locker: "#B-03", notes: "—" },
  /* Tyler Brooks is not in MEMBERS, so L() derived "TY" and the default tint. */
  { id: 106, initials: "TY", tint: "av-gold-t", name: "Tyler Brooks", plan: "Monthly Standard", time: "8:35 AM", status: "Checked Out" as LogStatus, trainer: "Cameron Boyd", locker: "#A-21", notes: "2h session" },
  { id: 107, initials: "CN", tint: "av-pink-t", name: "Chloe Nguyen", plan: "Student Plan", time: "8:28 AM", status: "In Gym" as LogStatus, trainer: "Lauren Hayes", locker: "#C-05", notes: "—" },
];
