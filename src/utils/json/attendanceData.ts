import type { AttendanceRecord, AttendanceStatus } from "../../types/attendance";


export const ATTENDANCE_STATUS_BADGE: Record<AttendanceStatus, string> = {
  Present: "badge-present",
  Absent: "badge-absent",
  Late: "badge-late",
  "On Leave": "badge-leave",
};

export const TRAINER_OPTIONS = [
  "Daniel Foster",
  "Rachel Morgan",
  "Andre Jackson",
  "Lauren Hayes",
  "Cameron Boyd",
];

export const PLAN_OPTIONS = [
  "Annual Premium",
  "Quarterly Gold",
  "Monthly Standard",
  "Student Plan",
];

export const ATTENDANCE_STATUS_OPTIONS: AttendanceStatus[] = [
  "Present",
  "Late",
  "Absent",
  "On Leave",
];

export const BULK_CODES: { code: string; status: AttendanceStatus }[] = [
  { code: "P", status: "Present" },
  { code: "L", status: "Late" },
  { code: "A", status: "Absent" },
  { code: "V", status: "On Leave" },
];

export const statusKey = (status: AttendanceStatus): string =>
  status === "On Leave" ? "leave" : status.toLowerCase();

export const HISTORY_DAYS = [
  "Today",
  "Yesterday",
  "Sat 11 Jul",
  "Fri 10 Jul",
  "Thu 09 Jul",
  "Wed 08 Jul",
  "Tue 07 Jul",
  "Mon 06 Jul",
  "Sun 05 Jul",
  "Sat 04 Jul",
];

export const ATTENDANCE: AttendanceRecord[] = [
  { id: "A-1001", name: "Ashley Bennett", initials: "AB", avatar: "av-gold", plan: "Annual Premium", trainer: "Daniel Foster", date: "2026-07-13", checkIn: "06:12 AM", checkOut: "07:48 AM", hours: "1h 36m", status: "Present" },
  { id: "A-1002", name: "Marcus Coleman", initials: "MC", avatar: "av-purple", plan: "Monthly Standard", trainer: "Andre Jackson", date: "2026-07-13", checkIn: "07:02 AM", checkOut: "—", hours: "—", status: "Late" },
  { id: "A-1003", name: "Jessica Ramirez", initials: "JR", avatar: "av-orange", plan: "Quarterly Gold", trainer: "Rachel Morgan", date: "2026-07-13", checkIn: "08:55 AM", checkOut: "10:20 AM", hours: "1h 25m", status: "Present" },
  { id: "A-1004", name: "Brooke Carter", initials: "BC", avatar: "av-red", plan: "Student Plan", trainer: "—", date: "2026-07-13", checkIn: "—", checkOut: "—", hours: "—", status: "Absent" },
  { id: "A-1005", name: "Grant Whitfield", initials: "GW", avatar: "av-cyan", plan: "Monthly Standard", trainer: "Cameron Boyd", date: "2026-07-13", checkIn: "—", checkOut: "—", hours: "—", status: "On Leave" },
  { id: "A-1006", name: "Tyler Brooks", initials: "TB", avatar: "av-gold", plan: "Annual Premium", trainer: "Daniel Foster", date: "2026-07-13", checkIn: "05:58 AM", checkOut: "07:30 AM", hours: "1h 32m", status: "Present" },
  { id: "A-1007", name: "Chloe Nguyen", initials: "CN", avatar: "av-purple", plan: "Student Plan", trainer: "Lauren Hayes", date: "2026-07-13", checkIn: "08:28 AM", checkOut: "—", hours: "—", status: "Present" },
  { id: "A-1008", name: "Kevin Barnes", initials: "KB", avatar: "av-green", plan: "Quarterly Gold", trainer: "Andre Jackson", date: "2026-07-13", checkIn: "07:15 AM", checkOut: "08:40 AM", hours: "1h 25m", status: "Late" },
  { id: "A-1009", name: "Isabella Romano", initials: "IR", avatar: "av-gold", plan: "Monthly Standard", trainer: "Rachel Morgan", date: "2026-07-13", checkIn: "—", checkOut: "—", hours: "—", status: "On Leave" },
  { id: "A-1010", name: "Corey Hughes", initials: "CH", avatar: "av-cyan", plan: "Student Plan", trainer: "—", date: "2026-07-13", checkIn: "—", checkOut: "—", hours: "—", status: "Absent" },
];
