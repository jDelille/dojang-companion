import type { CompanionContext } from "./companion";
import type { Member, MemberAttendance, WindowCount } from "./member";
import { membershipLabel } from "./member-presentation";

const countText = (value: WindowCount) => value.complete ? String(value.count)
  : value.count === 0 ? "Not known exactly" : `at least ${value.count}`;

// Display context from an already-authorized member read. Questions send only
// the member ID; Jodi re-reads scoped facts and owns all AI privacy policy.
export function memberCompanionContext(member: Member, attendance: MemberAttendance): CompanionContext {
  const intel = [
    { label: "Engagement", value: "Not available" },
    { label: "Retention risk", value: "Not available" },
    { label: "Testing readiness", value: member.testReadiness === undefined ? "Not available" : `${member.testReadiness}%` },
    { label: "Membership", value: membershipLabel(member) },
    { label: "Rank", value: member.rank.stripes === undefined ? member.rank.name : `${member.rank.name} · ${member.rank.stripes} stripes` },
    { label: "Check-ins, last 7 days", value: countText(attendance.lastSevenDays) },
  ];
  if (member.bookings) intel.push({ label: "Upcoming bookings", value: countText({ count: member.bookings.length, complete: !member.bookingsCapped }) });
  return {
    label: `Member context · ${member.name}`, intelTitle: "Member intelligence", intel,
    guidance: "Ask Companion about this member’s scoped Odoo record. Answers explain the available facts; no actions are executed.",
    suggestions: [], receipts: [],
  };
}
