import type { Lead } from "./lead";

// One lead's detail record (CRM screen C04). Shaped like the Hub's lead_details
// read (Jodi's dojo_companion_hub models/crm.py _lead_details, 16 Oct 2026),
// including task versions/manual-completion permission. Stages are omitted;
// only a stage proposal needs them.

// An Odoo activity (mail.activity) on the lead
export type LeadTask = {
  id: string;
  summary: string; // "Confirm trial with guardian"
  due: string; // "2026-10-27": Odoo activities have a due date, no time
  owner: string;
  state: "overdue" | "today" | "planned" | "done";
  feedback: string; // what staff recorded when it was done; "" otherwise
  version?: number; // missing on legacy reads: completion must stay unavailable
  canComplete?: boolean; // authoritative manual-completion permission
};

// A note staff left on the lead
export type LeadNote = {
  id: string;
  text: string;
  author: string;
  at: string; // ISO time
};

// One action taken through the Companion (a Hub receipt). Earlier Odoo history
// stays in Odoo, as Companion says on its lead view.
export type LeadTimelineEntry = {
  id: string;
  action: string; // the Hub operation, "reserve_trial"
  actor: string;
  at: string; // ISO time
};

export type LeadDetails = {
  lead: Lead;
  tasks: LeadTask[]; // open ones first, soonest due first (the Hub's order)
  memberId: string | null; // the member this lead is linked to, when there is one
  trial: { title: string; startsAt: string } | null; // the booked trial class
  // Newest first. null when the Hub didn't send notes (its CRM update isn't
  // installed): unknown, never "no notes".
  notes: LeadNote[] | null;
  timeline: LeadTimelineEntry[]; // in the order the Hub sends them
};
