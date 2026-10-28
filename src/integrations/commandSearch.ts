"use server";

import { explainHubError } from "@/domain/hubAction";
import type { PaletteLead, PalettePerson } from "@/domain/commands";
import { searchLeads } from "./crm";
import { getMembers } from "./member";

// The command bar's reads (views/shell/commandPalette.tsx). Both go through the
// same reads as the pages, as the signed-in staff member:
//   people  getMembers() -> the Hub's context member list (People's list)
//   leads   searchLeads() -> the Hub's crm_context with a query (Sales' read)
// In Hub mode, never fixture data. Read-only, and only the fields the command
// bar shows go back to the browser.

export type PeopleAnswer = { outcome: "loaded"; people: PalettePerson[] } | { outcome: "unavailable"; text: string };
export type LeadsAnswer =
  | { outcome: "loaded"; leads: PaletteLead[]; more: boolean }
  | { outcome: "unavailable"; text: string };

const QUERY_LIMIT = 100;

// Everyone People lists for this staff member. The command bar matches names
// itself, so this is read once when the bar opens.
export async function readPeopleForCommands(): Promise<PeopleAnswer> {
  try {
    const answer = await getMembers();
    if (answer.outcome !== "loaded") return { outcome: "unavailable", text: answer.text };
    return {
      outcome: "loaded",
      people: answer.members.map((member) => ({
        id: member.id,
        name: member.name,
        membershipState: member.membershipState,
        rank: member.rank.name,
      })),
    };
  } catch {
    return { outcome: "unavailable", text: explainHubError("HUB_NOT_CONFIGURED") };
  }
}

// Open leads whose name or contact matches, as Odoo matches them
export async function searchLeadsForCommands(query: string): Promise<LeadsAnswer> {
  if (typeof query !== "string" || !query.trim() || query.length > QUERY_LIMIT) {
    return { outcome: "unavailable", text: explainHubError("INVALID_COMMAND") };
  }
  try {
    const answer = await searchLeads(query);
    if (answer.outcome !== "loaded") return { outcome: "unavailable", text: answer.text };
    return {
      outcome: "loaded",
      leads: answer.leads.map((lead) => ({ id: lead.id, name: lead.name, contact: lead.contact, stage: lead.stage })),
      more: answer.moreLeads,
    };
  } catch {
    return { outcome: "unavailable", text: explainHubError("HUB_NOT_CONFIGURED") };
  }
}
