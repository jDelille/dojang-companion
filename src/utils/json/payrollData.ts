import type { PayrollStatus, StaffPay } from "../../types/payroll";

/*
   Payroll seed data — ported verbatim from tailwind/src/assets/js/payroll.js
   (STAFF, DEPTS, METHODS, STATUS, WITHHOLDING). Ids follow the P() 1-based
   sequence.
*/

export const PAYROLL_STATUS_BADGE: Record<PayrollStatus, string> = {
  Paid: "badge-present",
  Pending: "badge-late",
};

export const DEPTS = ["Training", "Reception", "Management", "Housekeeping", "Nutrition"];

export const PAYROLL_METHODS = ["Bank Transfer", "Apple Pay", "Check", "Cash"];

export const PAYROLL_STATUSES: PayrollStatus[] = ["Pending", "Paid"];

/*
   US withholding split (Austin, TX — no state income tax). The rates are used
   only to apportion the existing deduction total, so the five lines always
   re-sum to `deductions` and Net Pay stays exact.
*/
export const WITHHOLDING = [
  { key: "federal", rate: 0.12 },
  { key: "state", rate: 0 },
  { key: "ss", rate: 0.062 },
  { key: "medicare", rate: 0.0145 },
  { key: "401k", rate: 0.04 },
] as const;

export const WH_TOTAL = WITHHOLDING.reduce((s, w) => s + w.rate, 0);

export const STAFF: StaffPay[] = [
  { id: 1, name: "Daniel Foster", role: "Head Trainer", dept: "Training", basic: 5200, allowances: 1100, incentives: 750, deductions: 1667, status: "Pending" },
  { id: 2, name: "Rachel Morgan", role: "Yoga Instructor", dept: "Training", basic: 4000, allowances: 750, incentives: 450, deductions: 1230, status: "Pending" },
  { id: 3, name: "Andre Jackson", role: "HIIT Coach", dept: "Training", basic: 3800, allowances: 700, incentives: 560, deductions: 1197, status: "Paid" },
  { id: 4, name: "Lauren Hayes", role: "Spin Instructor", dept: "Training", basic: 3600, allowances: 650, incentives: 420, deductions: 1104, status: "Pending" },
  { id: 5, name: "Cameron Boyd", role: "Strength Coach", dept: "Training", basic: 4200, allowances: 850, incentives: 650, deductions: 1348, status: "Paid" },
  { id: 6, name: "Olivia Chen", role: "Front Desk Lead", dept: "Reception", basic: 3050, allowances: 500, incentives: 200, deductions: 887, status: "Pending" },
  { id: 7, name: "Tyler Brooks", role: "Receptionist", dept: "Reception", basic: 2500, allowances: 400, incentives: 150, deductions: 721, status: "Paid" },
  { id: 8, name: "Jordan Blake", role: "Branch Manager", dept: "Management", basic: 7450, allowances: 1700, incentives: 1150, deductions: 2436, status: "Pending" },
  { id: 9, name: "Natalie Rivera", role: "Nutritionist", dept: "Nutrition", basic: 4400, allowances: 800, incentives: 400, deductions: 1324, status: "Pending" },
  { id: 10, name: "Corey Teja", role: "Housekeeping", dept: "Housekeeping", basic: 1700, allowances: 250, incentives: 100, deductions: 485, status: "Paid" },
  { id: 11, name: "Megan Sullivan", role: "Assistant Manager", dept: "Management", basic: 5500, allowances: 1150, incentives: 750, deductions: 1750, status: "Pending" },
  { id: 12, name: "Miles Turner", role: "Housekeeping", dept: "Housekeeping", basic: 1600, allowances: 200, incentives: 50, deductions: 438, status: "Paid" },
];
