import type { Member, MemberStatus, PlanLabel } from "../../types/members";


export const PLAN_PRICE: Record<PlanLabel, number> = {
  "Annual Premium": 449,
  "Quarterly Gold": 129,
  "Monthly Standard": 49,
  "Student Plan": 29,
};

export const PLAN_CLASS: Record<PlanLabel, string> = {
  "Annual Premium": "gt",
  "Quarterly Gold": "c-yellow",
  "Monthly Standard": "c-orange",
  "Student Plan": "c-dim",
};

export const PLAN_UNIT: Record<PlanLabel, string> = {
  "Annual Premium": "/ yr",
  "Quarterly Gold": "/ qtr",
  "Monthly Standard": "/ mo",
  "Student Plan": "/ mo",
};

export const NEXT_EXPIRY: Record<PlanLabel, [string, string]> = {
  "Annual Premium": ["2028-01-15", "Jan 15, 2028"],
  "Quarterly Gold": ["2027-01-15", "Jan 15, 2027"],
  "Monthly Standard": ["2026-08-31", "Aug 31, 2026"],
  "Student Plan": ["2026-08-31", "Aug 31, 2026"],
};

export const MEMBER_STATUS_BADGE: Record<MemberStatus, string> = {
  Active: "badge-active",
  Expiring: "badge-pending",
  Expired: "badge-expired",
  Frozen: "badge-frozen",
};

export const PLAN_OPTIONS: PlanLabel[] = [
  "Annual Premium",
  "Quarterly Gold",
  "Monthly Standard",
  "Student Plan",
];

export const TRAINER_OPTIONS = ["None", "Daniel Foster", "Rachel Morgan", "Andre Jackson"];

export const TOTAL_MEMBERS = 1842;

export const MEMBERS: Member[] = [
  { id: "M-1001", first: "Ashley", last: "Bennett", phone: "(512) 555-0142", email: "ashley@example.com", planLabel: "Annual Premium", trainer: "Daniel Foster", checkins: 142, status: "Active", expiry: "2027-01-15", expiresDisp: "Jan 15, 2027", av: "av-gold", ini: "PS" },
  { id: "M-1002", first: "Marcus", last: "Coleman", phone: "(213) 555-0176", email: "marcus@example.com", planLabel: "Monthly Standard", trainer: "Andre Jackson", checkins: 8, status: "Expiring", expiry: "2026-07-31", expiresDisp: "Jul 31, 2026", av: "av-purple", ini: "RV" },
  { id: "M-1003", first: "Jessica", last: "Ramirez", phone: "(415) 555-0133", email: "jessica@example.com", planLabel: "Quarterly Gold", trainer: "Rachel Morgan", checkins: 67, status: "Active", expiry: "2026-09-30", expiresDisp: "Sep 30, 2026", av: "av-orange", ini: "NK" },
  { id: "M-1004", first: "Brooke", last: "Carter", phone: "(303) 555-0164", email: "brooke@example.com", planLabel: "Student Plan", trainer: "—", checkins: 0, status: "Expired", expiry: "2026-06-30", expiresDisp: "Jun 30, 2026", av: "av-red", ini: "SM" },
];
