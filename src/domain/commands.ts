import type { MembershipState } from "./member";

/*
   The command bar's results and what can be done with them, laid out as in the
   WhatsMax writeup's global command experience (PEOPLE with actions, COMMANDS,
   LIVE VIEW). Results are real Odoo records; the actions and commands that
   DreamOS can't run yet are listed with connected: false, shown disabled as
   "Not connected yet". Making one real later means setting connected: true and
   giving the palette what to do for its id, not redesigning the palette.
*/

// Sent on window to put the cursor in the command bar from a page (e.g. Front
// Desk's search box), like ⌘K
export const OPEN_COMMAND_EVENT = "dojang:open-command";

// A person from People's member list (the Hub's context read)
export type PalettePerson = {
  id: string;
  name: string;
  membershipState: MembershipState;
  rank: string; // "Unassigned" when Odoo has none
};

// An open lead from Sales' read (the Hub's crm_context with a query)
export type PaletteLead = {
  id: string;
  name: string;
  contact: string;
  stage: string;
};

export type PaletteAction = {
  id: string;
  label: string;
  connected: boolean; // false: shown disabled, "Not connected yet"
  ai?: boolean; // Ask AI (the agent), drawn with the AI colour
};

// The writeup's person actions, in its order. Only Open works: everything else
// is a write or the agent, and DreamOS is read-only for now.
export const PERSON_ACTIONS: PaletteAction[] = [
  { id: "open", label: "Open", connected: true },
  { id: "check_in", label: "Check In", connected: false },
  { id: "book", label: "Book", connected: false },
  { id: "message", label: "Message", connected: false },
  { id: "edit", label: "Edit", connected: false },
  { id: "evaluate", label: "Evaluate", connected: false },
  { id: "take_payment", label: "Take Payment", connected: false },
  { id: "ask_ai", label: "Ask AI", connected: false, ai: true },
];

// Lead actions: Open, and the lead writes the Hub has (not enabled in DreamOS)
export const LEAD_ACTIONS: PaletteAction[] = [
  { id: "open", label: "Open", connected: true },
  { id: "book_trial", label: "Book Trial", connected: false },
  { id: "add_note", label: "Add Note", connected: false },
  { id: "prepare_follow_up", label: "Prepare Follow-up", connected: false },
  { id: "ask_ai", label: "Ask AI", connected: false, ai: true },
];

// "Maya Chen" -> "Maya's"
function possessive(name: string) {
  const first = name.trim().split(/\s+/)[0] || name;
  return first.endsWith("s") ? `${first}'` : `${first}'s`;
}

// The writeup's COMMANDS for a person: questions for the agent. None are
// connected: they need Ask AI, and their reads (eligible classes, test
// readiness, household) don't reach DreamOS yet.
export function personCommands(person: PalettePerson): PaletteAction[] {
  return [
    { id: "eligible_classes", label: `Find ${possessive(person.name)} eligible classes`, connected: false, ai: true },
    { id: "test_readiness", label: `Explain ${possessive(person.name)} test readiness`, connected: false, ai: true },
    { id: "household", label: "Show household", connected: false },
  ];
}

// The live view's actions (writeup: Preview, Save View, Message, Create SOP)
export const LIVE_VIEW_ACTIONS: PaletteAction[] = [
  { id: "preview", label: "Preview", connected: false },
  { id: "save_view", label: "Save View", connected: false },
  { id: "message", label: "Message", connected: false },
  { id: "create_sop", label: "Create SOP", connected: false },
];

// A query that reads like a request ("parents with children ready for testing")
// rather than a name: three words or more. It gets the live view's honest
// "not connected" state, never made-up results.
export function looksLikeRequest(query: string) {
  return query.trim().split(/\s+/).filter(Boolean).length >= 3;
}
