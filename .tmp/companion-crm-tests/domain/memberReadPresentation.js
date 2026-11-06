"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceSummary = attendanceSummary;
exports.bookingsSummary = bookingsSummary;
// Shared read semantics: incomplete zero is unknown, never confirmed absence.
function attendanceSummary({ count, complete }) {
    if (complete)
        return `${count} check-ins in the last 7 days.`;
    return count > 0
        ? `At least ${count} check-ins in the last 7 days.`
        : "The last 7 days cannot be counted exactly from this read.";
}
function bookingsSummary(member) {
    if (member.bookings === undefined)
        return "Bookings are unavailable in this read.";
    const count = member.bookings.length;
    if (member.bookingsCapped) {
        return count === 0
            ? "The total is unknown; no bookings were included in this response."
            : `At least ${count} bookings; the source may have more.`;
    }
    return `${count} registered ${count === 1 ? "session" : "sessions"}.`;
}
