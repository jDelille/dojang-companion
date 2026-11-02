import type { CompanionContext, CompanionFocus } from "@/domain/companion";
import type { Member } from "@/domain/member";
import { memberCompanionContext } from "@/domain/memberCompanion";
import { devCompanionContext } from "@/server/companion-fixture";
import { hubEnabled } from "@/server/hub-gateway";
import { getMemberRecord, getMembers } from "./member";

// Where the Do For Me rail gets its context from. Runs on the server.
//
// In Hub mode (DOJANG_HUB_ENABLED=true) the People and member focuses are built
// only from the real Odoo records People already read (src/integrations/member.ts):
// facts, no suggestions and no actions, because the Hub sends no suggestions.
// The sales focus gets no context there yet (never fixture suggestions beside
// real leads). Otherwise everything comes from the fixture
// (src/server/companion-fixture.ts), outside production only.
//
// One lead's context isn't read here: the lead page builds it from the
// lead_details it already read, Odoo or sample alike (domain/leadFollowUp.ts).

const USES_SAMPLE_CONTEXT = process.env.NODE_ENV !== "production";

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
      return answer.outcome === "loaded" ? memberCompanionContext(answer.member, answer.attendance) : null;
    }
    // Sales suggestions aren't connected to Odoo yet: no fixture context beside
    // real leads. (A lead's context comes from its page, see above.)
    if (focus.kind === "sales" || focus.kind === "lead") return null;
  }
  if (USES_SAMPLE_CONTEXT) {
    return devCompanionContext(focus);
  }
  throw new Error("Do For Me isn't connected to Odoo yet");
}
