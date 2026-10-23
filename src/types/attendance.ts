
export type AttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";

export type AttendancePlan =
  | "Annual Premium"
  | "Quarterly Gold"
  | "Monthly Standard"
  | "Student Plan";

export type AttendanceRecord = {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  plan: AttendancePlan;
  trainer: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: AttendanceStatus;
  inHH?: string;
  outHH?: string;
};
