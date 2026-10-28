// What the shared Do For Me rail shows for the record or surface staff are on.
// Ported from Companion 1cab554b src/domain/companion.ts (only the read-only
// parts: no requests or approvals yet). The focus kinds follow Companion's
// viewFromPath (front desk / member / session), with the Sales and lead focus added.

export type Risk = "low" | "medium" | "high";

export type Suggestion = {
  id: string;
  title: string; // "Complete Poomsae evaluation tonight."
  explanation: string; // the evidence, in one line
  actionLabel: string; // "Schedule evaluation"
  capability: string; // "member.prepare_promotion"
  risk: Risk;
  preview: { label: string; value: string }[]; // what will happen, field by field
  // DreamOS additions (not in Companion's Suggestion):
  // "page": the review with Apply opens in the page's centre and the rail shows
  // the evidence (Jodi's 19 Oct Do For Me spec). Otherwise Work shows the review.
  review?: "page";
  evidence?: { label: string; value: string }[]; // the records the suggestion is based on
};

// Comes back from the approvals route once one exists. Never built in the browser.
export type Receipt = {
  id: string;
  suggestionId: string; // the task it completed
  summary: string; // "Send waiver reminder"
  actor: string; // "Jamie · via Companion"
  at: string; // ISO time; the browser formats it as "2:14 PM"
};

// What the rail is focused on
export type CompanionFocus =
  | { kind: "people" }
  | { kind: "member"; memberId: string }
  | { kind: "sales" }
  | { kind: "lead"; leadId: string }
  | { kind: "inbox" }
  | { kind: "message"; messageId: string }; // one Hub inbox message (work item)

// "people", "member:5001", "sales", "lead:9005", "inbox", "message:4001". The rail
// remembers its tab and picked task per key, so coming back to a record finds
// it as it was left.
export function focusKey(focus: CompanionFocus): string {
  if (focus.kind === "member") return `member:${focus.memberId}`;
  if (focus.kind === "lead") return `lead:${focus.leadId}`;
  if (focus.kind === "message") return `message:${focus.messageId}`;
  return focus.kind;
}

export type CompanionContext = {
  label: string; // the line at the top of Plan, "Member context"
  intelTitle: string; // "Member intelligence"
  intel: { label: string; value: string }[];
  guidance?: string; // what staff do next on the page, when it isn't a suggestion
  featured?: { suggestion: Suggestion; summary: string }; // the "Suggested" card
  suggestions: Suggestion[];
  receipts: Receipt[];
  // DreamOS addition: records to open (e.g. Front Desk's due follow-ups), each
  // with "Open". Plain links to Odoo records, never suggestions or AI output.
  links?: { id: string; title: string; detail?: string; href: string }[];
};
