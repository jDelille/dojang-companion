// DEVELOPMENT-ONLY Do For Me context. Fictional.
// Only src/integrations/companion.ts reads this, and only outside production.
//
// Ported from Companion 1cab554b src/integrations/mock/companion.ts (getContextFor
// and Maya's suggestion). As there, the facts are built from the records
// themselves (sample members and leads), never from mockup numbers. Suggestions:
// Maya's (from Companion), and a lead follow-up wherever the Hub's lead evidence
// recommends one (the shared fixed rule in domain/leadFollowUp.ts, the same one
// Odoo leads use). It maps to the Hub's prepare_lead_action.

import type {
  CompanionContext,
  CompanionFocus,
  Suggestion,
} from "../domain/companion";
import { leadCompanionContext } from "../domain/leadFollowUp";
import { membershipLabel } from "../domain/member-presentation";
import { devCrmContext, devLeadDetails } from "./crm-fixture";
import { devMembers } from "./member-fixture";

type Featured = { suggestion: Suggestion; summary: string };

// Only Maya (5001) has a scripted suggestion, same as Companion
const featuredByMember: Record<string, Featured> = {
  "5001": {
    summary: "One remaining curriculum requirement blocks testing eligibility.",
    suggestion: {
      id: "maya-poomsae",
      title: "Complete Poomsae evaluation tonight.",
      explanation:
        "Maya meets the attendance requirement (88%) and has completed her other curriculum items. The Poomsae evaluation is the last requirement before she's testing eligible, and Master Kim teaches her 5:45 class tonight.",
      actionLabel: "Schedule evaluation",
      capability: "member.prepare_promotion",
      risk: "medium",
      preview: [
        { label: "Evaluation", value: "Poomsae (forms)" },
        { label: "When", value: "Tonight · 5:45 Children Advanced" },
        { label: "Evaluator", value: "Master Kim" },
        { label: "Approval", value: "Instructor sign-off" },
      ],
    },
  },
};

const EMPTY = { suggestions: [], receipts: [] };

function peopleContext(): CompanionContext {
  const count = (state: string) =>
    devMembers.filter((member) => member.membershipState === state).length;
  return {
    ...EMPTY,
    label: "People context",
    intelTitle: "Members",
    intel: [
      { label: "Members", value: String(devMembers.length) },
      { label: "Active", value: String(count("active")) },
      { label: "Trial", value: String(count("trial")) },
      { label: "Lead", value: String(count("lead")) },
    ],
  };
}

function memberContext(memberId: string): CompanionContext | null {
  const member = devMembers.find((person) => person.id === memberId);
  if (!member) return null;

  const intel = [
    { label: "Membership", value: membershipLabel(member) },
    { label: "Rank", value: member.rank.name },
  ];
  if (member.testReadiness !== undefined) {
    intel.push({ label: "Test readiness", value: `${member.testReadiness}%` });
  }

  return {
    ...EMPTY,
    label: `Member context · ${member.name}`,
    intelTitle: "Member intelligence",
    intel,
    featured: featuredByMember[memberId],
  };
}

function salesContext(): CompanionContext {
  const { leads } = devCrmContext();
  const open = leads.filter((lead) => !lead.lostReason);
  return {
    ...EMPTY,
    label: "Sales context",
    intelTitle: "Pipeline",
    intel: [
      { label: "Open leads", value: String(open.length) },
      {
        label: "Trials booked",
        value: String(open.filter((lead) => lead.stage === "Trial booked").length),
      },
      { label: "Lost", value: String(leads.length - open.length) },
    ],
  };
}

// A sample lead's context: the same shared rule and context as an Odoo lead
// (domain/leadFollowUp.ts), from the sample lead's record
function leadContext(leadId: string): CompanionContext | null {
  const details = devLeadDetails(leadId);
  return details ? leadCompanionContext(details) : null;
}

// null for an unknown member or lead: a context never borrows another record's tasks
export function devCompanionContext(focus: CompanionFocus): CompanionContext | null {
  if (focus.kind === "people") return peopleContext();
  if (focus.kind === "member") return memberContext(focus.memberId);
  if (focus.kind === "sales") return salesContext();
  if (focus.kind === "lead") return leadContext(focus.leadId);
  // Inbox and message focus come from the Hub's own inbox read, built on the
  // inbox page (views/inbox/inboxCompanion.ts), not from this fixture
  return null;
}
