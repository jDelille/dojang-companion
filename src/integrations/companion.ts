import type { CompanionContext, CompanionFocus } from "@/domain/companion";
import type { Member, MemberAttendance, WindowCount } from "@/domain/member";
import { membershipLabel } from "@/domain/member-presentation";
import { devCompanionContext } from "@/server/companion-fixture";
import { hubEnabled } from "@/server/hub-gateway";
import { getMemberRecord, getMembers } from "./member";

// The only place the Do For Me rail gets its context from. Runs on the server.
//
// In Hub mode (DOJANG_HUB_ENABLED=true) the People and member focuses are built
// only from the real Odoo records People already read (src/integrations/member.ts):
// facts, no suggestions and no actions, because DreamOS is read-only there and
// the Hub sends no suggestions. Sales and lead focuses get no context there yet
// (never fixture suggestions beside real leads). Otherwise everything comes from the fixture
// (src/server/companion-fixture.ts), outside production only.

const USES_SAMPLE_CONTEXT = process.env.NODE_ENV !== "production";

const READ_ONLY_GUIDANCE =
  "Read-only connection: this is the member's Odoo record. Do For Me has no suggestions or actions here yet.";

function realPeopleContext(members: Member[]): CompanionContext {
  const count = (state: string) => members.filter((member) => member.membershipState === state).length;
  return {
    label: "People context · Odoo",
    intelTitle: "Members",
    intel: [
      { label: "Members", value: String(members.length) },
      { label: "Active", value: String(count("active")) },
      { label: "Trial", value: String(count("trial")) },
      { label: "Lead", value: String(count("lead")) },
    ],
    suggestions: [],
    receipts: [],
  };
}

// "4" (exact), "at least 30" when the source's list was cut off, and "Not known
// exactly" for an incomplete 0, which is unknown, never "none"
function countText(value: WindowCount) {
  if (value.complete) return String(value.count);
  if (value.count === 0) return "Not known exactly";
  return `at least ${value.count}`;
}

function realMemberContext(member: Member, attendance: MemberAttendance): CompanionContext {
  const rank =
    member.rank.stripes === undefined
      ? member.rank.name
      : `${member.rank.name} · ${member.rank.stripes} ${member.rank.stripes === 1 ? "stripe" : "stripes"}`;
  const intel = [
    { label: "Membership", value: membershipLabel(member) },
    { label: "Rank", value: rank },
    { label: "Check-ins, last 7 days", value: countText(attendance.lastSevenDays) },
  ];
  // Left out when the bookings couldn't be read (never a stand-in 0)
  if (member.bookings) {
    intel.push({
      label: "Upcoming bookings",
      value: countText({ count: member.bookings.length, complete: !member.bookingsCapped }),
    });
  }
  return {
    label: `Member context · ${member.name}`,
    intelTitle: "Member intelligence",
    intel,
    guidance: READ_ONLY_GUIDANCE,
    suggestions: [],
    receipts: [],
  };
}

// The context for one focus, or null when its member or lead doesn't exist or
// can't be read (the page shows why)
export async function getCompanionContext(
  focus: CompanionFocus,
): Promise<CompanionContext | null> {
  if (hubEnabled()) {
    if (focus.kind === "people") {
      const answer = await getMembers();
      return answer.outcome === "loaded" ? realPeopleContext(answer.members) : null;
    }
    if (focus.kind === "member") {
      const answer = await getMemberRecord(focus.memberId);
      return answer.outcome === "loaded" ? realMemberContext(answer.member, answer.attendance) : null;
    }
    // Sales and lead suggestions aren't connected to Odoo yet: no fixture
    // context beside real leads
    if (focus.kind === "sales" || focus.kind === "lead") return null;
  }
  if (USES_SAMPLE_CONTEXT) {
    return devCompanionContext(focus);
  }
  throw new Error("Do For Me isn't connected to Odoo yet");
}
