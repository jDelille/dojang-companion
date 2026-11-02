import type { LeadDetails } from "../leadDetails";
import type { Member } from "../member";
import { membershipLabel } from "../member-presentation";
import type { Subject } from "./definition";

/*
   A workflow subject from the Hub reads DreamOS already makes: a lead from
   lead_details, a member from member_details. Only what the read returned:
   a field or fact the read didn't have is left out, so a template using it
   blocks and a condition checking it is unknown (definition.ts).
*/

export function leadSubject(details: LeadDetails): Subject {
  const { lead } = details;
  const fields: Record<string, string> = {};
  if (lead.name) fields.name = lead.name;
  if (lead.contact) fields.contact = lead.contact;
  if (lead.stage) fields.stage = lead.stage;
  if (lead.owner) fields.owner = lead.owner;

  const facts: Record<string, string | number | boolean> = {};
  // Open tasks only from the Hub's evidence: the task list may be cut off
  if (lead.evidence) facts.openTasks = lead.evidence.openTasks;
  // Lost is an archived lead with a reason; Won/Lost journeys come from evidence
  if (lead.lostReason) facts.closed = true;
  else if (lead.evidence) facts.closed = lead.evidence.journey === "Won" || lead.evidence.journey === "Lost";

  return { kind: "lead", id: lead.id, version: lead.version, fields, facts };
}

// The Member shape has no version (member_details' version isn't kept yet), so
// no member write can be built from it; none is connected anyway (actions.ts).
export function memberSubject(member: Member): Subject {
  const fields: Record<string, string> = {};
  if (member.name) fields.name = member.name;
  if (member.rank.name) fields.rank = member.rank.name;
  fields.membership = membershipLabel(member);
  return { kind: "member", id: member.id, version: null, fields, facts: {} };
}
