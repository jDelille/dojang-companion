import type { CompanionContext, Suggestion } from "./companion";
import type { CompanionAnswer } from "./companionHub";

/*
   "Ask the agent" in the Do For Me rail: the conversation, the stream the
   server sends back, and the answers that come from the page's own records.

   The conversation runtime is adapted from Roster 1.0.0 (docs/LICENSE-MAP.md):
   lib/ai/adapter.ts (ChatMessage, StreamChunk), the SSE events of
   app/api/agents/[id]/chat/route.ts (meta, token, error, done) and the
   honest failure states of components/agents/test-chat.tsx ("stopped early",
   "connection dropped"). Roster's Prisma conversations, workspaces, personas
   and direct model calls are not taken: the agent's facts and policy belong to
   the Hub/Odoo. Typed questions use its verified companion_ask read for member
   or general site scope. History is local-only; Jodi answers each question
   independently. Lead-specific AI is not supported by that contract.

   Quick asks (Summarize, Why?, What changes?) never leave the browser. They
   restate the rail's context, which the page read from Odoo (or the
   development fixture), and are labelled "From this page's records · Not AI".
   They never add a fact, a number or an action of their own.
*/

// One fact line, as in the rail's FactList
export type Fact = { label: string; value: string };

// Where an agent turn's text came from
//   records  restated from the page's context in the browser, not AI
//   agent    returned by Jodi and adapted into the UI event protocol
export type AgentSource = "records" | "agent";

export type AgentTurn = {
  role: "staff" | "agent";
  text: string;
  source?: AgentSource; // agent turns only
  facts?: Fact[]; // records answers: the facts it restates
  // A suggestion the answer is about. The rail offers "Review" for it, which
  // opens the same governed review as Do For Me. Nothing is applied from here.
  review?: Suggestion;
  error?: string; // shown under the text; the turn did not finish
  focus?: CompanionAnswer["focus"];
  mode?: string;
};

// Compatibility history accepted by the DreamOS route; never forwarded to Jodi.
export type AgentHistoryEntry = { role: "staff" | "agent"; text: string };

// POST /api/companion/ask
export type AgentQuestion = {
  focusKey: string; // "member:5001", "lead:9005", "front-desk", …
  question: string;
  history: AgentHistoryEntry[];
};

export const QUESTION_LIMIT = 500; // verified companion_ask limit
export const HISTORY_LIMIT = 20; // turns sent with a question
export const HISTORY_TEXT_LIMIT = 4000; // characters per turn

// The server's stream, as Server-Sent Events (Roster's chat route):
//   event: meta   data: { provider }
//   event: token  data: { text }
//   event: error  data: { code }
//   event: done   data: {}
// A stream that ends without "done" did not finish, and the rail says so.
export type AgentStreamEvent =
  | { event: "meta"; provider: string; focus?: CompanionAnswer["focus"]; mode?: string }
  | { event: "token"; text: string }
  | { event: "error"; code: string }
  | { event: "done" };

// What the server's agent provider yields (Roster's StreamChunk, without token usage)
export type AgentChunk = { type: "text"; text: string } | { type: "error"; code: string } | { type: "done" };

const ERROR_MESSAGES: Record<string, string> = {
  AGENT_NOT_CONNECTED:
    "The Companion backend is not connected in this environment.",
  HUB_NOT_CONFIGURED: "The authenticated Odoo connection is not configured. AI questions are unavailable in fixture mode.",
  AI_DISABLED: "AI is disabled for this site or the backend. No AI answer was generated.",
  AI_UNAVAILABLE: "The AI service could not produce an answer. Try again later.",
  BACKEND_UNAVAILABLE: "Odoo is unavailable. Your question could not be answered.",
  HUB_RESPONSE_UNREADABLE: "Odoo returned an answer with invalid data or a different record scope. It was not displayed.",
  LEAD_AI_UNSUPPORTED: "Lead-aware AI is not connected yet. Use the recorded evidence and the governed follow-up review on this lead; no site answer was substituted.",
  CONTEXT_UNSUPPORTED: "AI cannot use this record context yet. Open a member record or a general workspace to ask a supported question.",
  MEMBER_UNAVAILABLE: "This member is unavailable within your staff grant. No answer was displayed.",
  SESSION_UNAVAILABLE: "This class is unavailable within your staff grant. No answer was displayed.",
  UNAUTHENTICATED: "Your staff session has ended. Sign in again.",
  INVALID_COMMAND: "The Companion request was rejected as invalid. This may be a request-format or backend-contract mismatch; it does not necessarily mean your question is too long.",
  FORBIDDEN: "You don't have access to do this.",
  SIGN_IN_REQUIRED: "Sign in with your Odoo staff account.",
  STOPPED_EARLY: "The answer stopped early. Ask again to retry.",
  CONNECTION_DROPPED: "The connection dropped. Ask again to retry.",
};

export function explainAgentError(code: string, stage?: string | null) {
  if (code === "INVALID_COMMAND" && stage === "hub") return "Odoo rejected the Companion request (INVALID_COMMAND). The deployed companion_ask operation or its payload contract needs checking; shortening your question is not the fix.";
  if (code === "INVALID_COMMAND" && stage === "focus") return "The selected record cannot be mapped to a valid Companion request. Reopen the member record and try again.";
  if (code === "INVALID_COMMAND" && stage === "request") return "DreamOS rejected the chat request format. Questions must be 1–500 characters; a short question may indicate an outdated client. Reload the page and try again.";
  return ERROR_MESSAGES[code] ?? "The agent couldn't answer. Ask again to retry.";
}

// Splits Server-Sent Events text into events. Returns the events found and the
// unfinished rest, which waits for the next chunk. A frame that can't be read
// is skipped rather than ending the stream (Roster's test-chat parser).
export function readStreamEvents(buffer: string): { events: AgentStreamEvent[]; rest: string } {
  const frames = buffer.split("\n\n");
  const rest = frames.pop() ?? "";
  const events: AgentStreamEvent[] = [];

  for (const frame of frames) {
    const lines = frame.split("\n");
    const eventLine = lines.find((line) => line.startsWith("event: "));
    const dataLine = lines.find((line) => line.startsWith("data: "));
    if (!eventLine || !dataLine) continue;

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(dataLine.slice(6));
    } catch {
      continue;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) continue;
    const name = eventLine.slice(7).trim();
    if (name === "meta" && typeof data.provider === "string") {
      const focus = data.focus;
      const validFocus = !!focus && typeof focus === "object" && "kind" in focus && "id" in focus
        && ["member", "session", "site"].includes(String(focus.kind))
        && (focus.id === null || typeof focus.id === "string");
      events.push({ event: "meta", provider: data.provider,
        ...(validFocus ? { focus: focus as CompanionAnswer["focus"] } : {}),
        ...(typeof data.mode === "string" ? { mode: data.mode } : {}),
      });
    }
    if (name === "token" && typeof data.text === "string") events.push({ event: "token", text: data.text });
    if (name === "error") {
      events.push({ event: "error", code: typeof data.code === "string" ? data.code : "UNKNOWN" });
    }
    if (name === "done") events.push({ event: "done" });
  }
  return { events, rest };
}

// One event as the text the server writes
export function streamEventText(event: AgentStreamEvent) {
  const { event: name, ...data } = event;
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ── Quick asks: answers from the page's records ──────────────────────────────

export type QuickAsk = "summarize" | "why" | "changes";

export const QUICK_ASKS: { id: QuickAsk; label: string; question: string }[] = [
  { id: "summarize", label: "Summarize", question: "Summarize what's on this page." },
  { id: "why", label: "Why?", question: "Why is this suggested?" },
  { id: "changes", label: "What changes?", question: "What would change if I apply it?" },
];

// The suggestion a quick ask is about: the one picked in the rail, else the
// focus's top suggestion (the same one Evidence shows)
export function suggestionInFocus(context: CompanionContext, picked: Suggestion | null) {
  return picked ?? context.featured?.suggestion ?? context.suggestions[0] ?? null;
}

const basisLine = (suggestion: Suggestion) =>
  suggestion.basis === "rule" ? "It comes from a fixed Odoo rule, not AI." : "It is a suggestion, not a change.";

export function answerFromRecords(
  ask: QuickAsk,
  context: CompanionContext,
  picked: Suggestion | null,
): AgentTurn {
  const suggestion = suggestionInFocus(context, picked);

  if (ask === "summarize") {
    const parts = [`${context.label}.`];
    if (context.guidance) parts.push(context.guidance);
    if (context.links && context.links.length > 0) {
      const count = context.links.length;
      parts.push(`${count} ${count === 1 ? "record is" : "records are"} listed in Plan to open.`);
    }
    if (suggestion) parts.push(`Suggested: ${suggestion.title}.`);
    else parts.push("There are no suggestions here.");
    return {
      role: "agent",
      source: "records",
      text: parts.join(" "),
      facts: context.intel,
      review: suggestion ?? undefined,
    };
  }

  if (!suggestion) {
    return {
      role: "agent",
      source: "records",
      text: "There's no suggestion on this page, so there's nothing to explain and nothing would change.",
    };
  }

  if (ask === "why") {
    return {
      role: "agent",
      source: "records",
      text: `${suggestion.explanation} ${basisLine(suggestion)}`,
      facts: suggestion.evidence,
      review: suggestion,
    };
  }

  return {
    role: "agent",
    source: "records",
    text: `"${suggestion.actionLabel}" would make the changes below. Nothing changes until you apply it in the review.`,
    facts: suggestion.preview,
    review: suggestion,
  };
}
