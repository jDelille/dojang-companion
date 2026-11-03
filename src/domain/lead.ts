// A CRM lead as the Sales pipeline (CRM screen C03) shows it. Shaped like the
// Hub's crm_context read (Companion 1cab554b app/(companion)/hub/CrmWorkspace.tsx;
// Jodi's dojo_companion_hub models/crm.py _lead_row), including canEditContact.
// The read's tasks are the follow-ups (domain/followUp.ts).

import type { FollowUpsRead } from "./followUp";

export type CrmStage = {
  id: string; // Odoo crm.stage id. Never hardcode these: always read them from the context
  name: string; // "Trial booked"
};

export type LeadTag = { id: string; name: string };

// The Hub's explainable lead evidence (crm.py _lead_evidence, "v1-fixed-evidence"):
// record completeness, never a conversion probability. Only the fields the
// Companion screens use; the Hub also sends score, scoreKind, method and reasons.
export type LeadEvidence = {
  journey: string; // "New", "Contacted", "Trial", "Stage review", "Won", "Lost"…
  priority: "Low" | "Normal" | "High" | "Now";
  priorityReason: string; // "No open next action is recorded."
  nextAction: "follow_up" | "trial" | "reactivation" | "conversion";
  openTasks: number;
  overdueTasks: number;
  dueToday: number;
  trialLinked: boolean;
  memberLinked: boolean;
};

export type Lead = {
  id: string;
  name: string; // the prospective student, "Ava Martinez"
  contact: string; // who staff talk to, "Rosa Martinez (parent)"
  email: string; // "" when not recorded
  phone: string; // "" when not recorded
  version: number; // send back as expectedVersion on a write; a mismatch is VERSION_CONFLICT
  stageId: string | null; // null when the lead has no stage
  stage: string; // the stage's name, as the Hub sends it
  ownerId: string | null; // null = unassigned
  owner: string;
  source: string; // "Website", "Walk-in", "Referral"…
  // PROVISIONAL: the Hub sends interests as lead tags ("All tags / interests").
  // Odoo's tags mix programs, sources and ages, so screens show them as "Tags"
  // until there's an agreed program field.
  tags: LeadTag[];
  canEditContact?: boolean; // Hub permission/relationship hint; server rechecks.
  evidence?: LeadEvidence; // absent when the Hub's CRM update isn't installed
  // PROVISIONAL: Odoo marks a lost lead by archiving it with a lost reason, so Lost
  // isn't a pipeline stage. The Hub's crm_context search leaves archived leads out.
  lostReason?: string;
};

// Someone CRM work can be assigned to (crm_context.assignees: the site's owner
// and manager grants). Read for the follow-up owner filter, and for assigning
// leads and tasks once those writes are enabled.
export type CrmAssignee = { id: string; name: string };
export type LeadAssigneesRead =
  | { outcome: 'loaded'; assignees: CrmAssignee[] }
  | { outcome: 'unavailable'; code: string; text: string };

export type CrmContext = {
  stages: CrmStage[]; // in pipeline order
  leads: Lead[];
  moreLeads: boolean; // true when the Hub capped the list (it sends the latest 100)
  followUps: FollowUpsRead; // open tasks on leads and members (domain/followUp.ts)
  assignees: CrmAssignee[] | null; // null when this Hub version doesn't send them
};
