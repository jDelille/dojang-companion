"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceLabel = exports.ATTENDANCE_LABELS = exports.EXPECTED_STATES = exports.ARRIVED_STATES = void 0;
// Booked members who are here: the statuses the Hub's own operations report
// counts as attended
exports.ARRIVED_STATES = ["present", "late"];
// Booked and nothing recorded yet (the booking's default attendance state)
exports.EXPECTED_STATES = ["pending"];
// Odoo's attendance values (dojo.attendance.log status, dojo.class.enrollment
// attendance_state)
exports.ATTENDANCE_LABELS = {
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
const attendanceLabel = (value) => exports.ATTENDANCE_LABELS[value] ?? value;
exports.attendanceLabel = attendanceLabel;
