/* Payroll types — ported from tailwind/src/assets/js/payroll.js */

export type PayrollStatus = "Paid" | "Pending";

export type StaffPay = {
  id: number;
  name: string;
  role: string;
  dept: string;
  basic: number;
  allowances: number;
  incentives: number;
  deductions: number;
  status: PayrollStatus;
};

/** The five withholding lines; they always re-sum to `deductions`. */
export type Withholding = {
  federal: number;
  state: number;
  ss: number;
  medicare: number;
  "401k": number;
};

/** Fields the Add / Edit Payroll modal collects. */
export type PayrollFormValues = {
  name: string;
  role: string;
  dept: string;
  basic: number;
  allowances: number;
  incentives: number;
  deductions: number;
  status: PayrollStatus;
};
