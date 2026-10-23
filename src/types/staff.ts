/* Staff types — ported from tailwind/src/assets/js/staff.js */

export type StaffDept =
  | "Training"
  | "Reception"
  | "Management"
  | "Housekeeping"
  | "Nutrition";

export type StaffShift = "Morning" | "Evening" | "Off";

export type StaffStatus = "Present" | "Leave" | "Off";

export type StaffMember = {
  id: number;
  name: string;
  role: string;
  dept: StaffDept;
  shift: StaffShift;
  phone: string;
  email: string;
  status: StaffStatus;
  salary: number;
};

/** Fields the Add / Edit Staff modal collects. */
export type StaffFormValues = {
  name: string;
  role: string;
  dept: StaffDept;
  shift: StaffShift;
  phone: string;
  email: string;
  salary: string;
};

/** Fields the Assign Role modal collects. */
export type StaffRoleValues = {
  role: string;
  dept: StaffDept;
  shift: StaffShift;
};

/** One cell of the attendance week strip. */
export type AttendanceMark = "present" | "leave" | "off";
