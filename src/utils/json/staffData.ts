import type {
  StaffDept,
  StaffMember,
  StaffShift,
  StaffStatus,
} from "../../types/staff";

/*
   Staff seed data — ported verbatim from tailwind/src/assets/js/staff.js
   (STAFF, AV, STATUS, PRES, SHIFT_COLOR, SHIFT_TIME, SHIFTS, DEPTS, WEEK).
   The S() factory defaults (email "—", salary 2850) are expanded into explicit
   literals with the 1-based ids the idSeq counter produced.
*/

export const AV = ["av-gold", "av-purple", "av-orange", "av-cyan", "av-green", "av-red"];

export const avatarFor = (id: number) => AV[id % AV.length];

export const STAFF_STATUS_BADGE: Record<StaffStatus, string> = {
  Present: "badge-present",
  Leave: "badge-late",
  Off: "badge-inactive",
};

export const STAFF_STATUSES: StaffStatus[] = ["Present", "Leave", "Off"];

export const PRES: Record<StaffStatus, string> = {
  Present: "#4ADE80",
  Leave: "#FB923C",
  Off: "#6B7280",
};

export const SHIFT_COLOR: Record<StaffShift, string> = {
  Morning: "#D4AF37",
  Evening: "#818CF8",
  Off: "#2E2E34",
};

export const SHIFT_TIME: Record<StaffShift, string> = {
  Morning: "5 AM – 2 PM",
  Evening: "2 PM – 11 PM",
  Off: "Day Off",
};

export const SHIFTS: StaffShift[] = ["Morning", "Evening", "Off"];

export const DEPTS: StaffDept[] = [
  "Training",
  "Reception",
  "Management",
  "Housekeeping",
  "Nutrition",
];

export const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const STAFF: StaffMember[] = [
  { id: 1, name: "Daniel Foster", role: "Head Trainer", dept: "Training", shift: "Morning", phone: "(512) 555-0155", email: "daniel@example.com", status: "Present", salary: 5200 },
  { id: 2, name: "Rachel Morgan", role: "Yoga Instructor", dept: "Training", shift: "Morning", phone: "(305) 555-0129", email: "rachel@example.com", status: "Present", salary: 4000 },
  { id: 3, name: "Andre Jackson", role: "HIIT Coach", dept: "Training", shift: "Evening", phone: "(512) 555-0130", email: "andre@example.com", status: "Present", salary: 3800 },
  { id: 4, name: "Lauren Hayes", role: "Spin Instructor", dept: "Training", shift: "Evening", phone: "(213) 555-0131", email: "ashton@example.com", status: "Leave", salary: 3600 },
  { id: 5, name: "Cameron Boyd", role: "Strength Coach", dept: "Training", shift: "Morning", phone: "(415) 555-0132", email: "cameron@example.com", status: "Present", salary: 4200 },
  { id: 6, name: "Olivia Chen", role: "Front Desk Lead", dept: "Reception", shift: "Morning", phone: "(303) 555-0133", email: "olivia@example.com", status: "Present", salary: 3050 },
  { id: 7, name: "Tyler Brooks", role: "Receptionist", dept: "Reception", shift: "Evening", phone: "(206) 555-0134", email: "tyler@example.com", status: "Present", salary: 2500 },
  { id: 8, name: "Jordan Blake", role: "Branch Manager", dept: "Management", shift: "Morning", phone: "(305) 555-0135", email: "jordan@example.com", status: "Present", salary: 7450 },
  { id: 9, name: "Megan Sullivan", role: "Assistant Manager", dept: "Management", shift: "Evening", phone: "(512) 555-0136", email: "megan@example.com", status: "Present", salary: 5500 },
  { id: 10, name: "Natalie Rivera", role: "Nutritionist", dept: "Nutrition", shift: "Morning", phone: "(213) 555-0137", email: "natalie@example.com", status: "Leave", salary: 4400 },
  { id: 11, name: "Corey Teja", role: "Housekeeping", dept: "Housekeeping", shift: "Morning", phone: "(415) 555-0138", email: "corey@example.com", status: "Present", salary: 1700 },
  { id: 12, name: "Miles Turner", role: "Housekeeping", dept: "Housekeeping", shift: "Off", phone: "(303) 555-0139", email: "arjunn@example.com", status: "Off", salary: 1600 },
];
