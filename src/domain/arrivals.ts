// Front Desk arrivals: one class's roster as the Hub's session_roster read gives
// it (Jodi's dojo_companion_hub models/operations.py _session_roster, 16 Oct 2026):
//
//   { session: { id, name, startsAt, endsAt, instructor, state },
//     timeZone, generatedAt,
//     members: [{ id, name, rank, attendance }] }
//
// members are the class's registered bookings (at most 500; more is the error
// REPORT_TOO_LARGE, never a cut-off list). attendance is the member's recorded
// attendance log status when there is one, otherwise the booking's attendance
// state. Odoo sends no class capacity.

export type RosterSession = {
  id: string;
  name: string; // the class template's name, "Children Advanced"
  startsAt: string; // ISO time
  endsAt: string;
  instructor: string | null; // null when none is assigned (or not this school's)
  state: string; // dojo.class.session state, "open"
};

export type RosterMember = {
  id: string; // the dojo.member id (Member 360's id)
  name: string;
  rank: string; // "Not recorded" when Odoo has none
  attendance: string; // see ATTENDANCE_LABELS
};

export type SessionRoster = {
  session: RosterSession;
  timeZone: string; // the school's time zone, "America/Phoenix"
  generatedAt: string;
  members: RosterMember[];
};

// Booked members who are here: the statuses the Hub's own operations report
// counts as attended
export const ARRIVED_STATES = ["present", "late"];
// Booked and nothing recorded yet (the booking's default attendance state)
export const EXPECTED_STATES = ["pending"];

// Odoo's attendance values (dojo.attendance.log status, dojo.class.enrollment
// attendance_state)
export const ATTENDANCE_LABELS: Record<string, string> = {
  pending: "Not arrived",
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
  sick: "Sick",
  injury: "Injury",
  vacation: "Vacation",
  other: "Other",
};

export const attendanceLabel = (value: string) => ATTENDANCE_LABELS[value] ?? value;
