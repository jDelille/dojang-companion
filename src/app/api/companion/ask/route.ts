// POST /api/companion/ask: a typed question from the Do For Me rail's
// "Ask the agent". Body (src/domain/companionAgent.ts AgentQuestion):
//   { focusKey, question, history: [{ role, text }] }
//
// Answers as Server-Sent Events (meta, token, error, done), the stream shape of
// Roster 1.0.0 app/api/agents/[id]/chat/route.ts. The whole Hub answer is adapted
// to one token and done. Authentication and backend errors retain HTTP status.

import {
  HISTORY_LIMIT,
  HISTORY_TEXT_LIMIT,
  QUESTION_LIMIT,
  streamEventText,
  type AgentHistoryEntry,
  type AgentStreamEvent,
} from "@/domain/companionAgent";
import { agentProvider, type AgentRequest } from "@/server/companion-agent";
import { requireHubStaff } from "@/server/hub-gateway";

export const dynamic = "force-dynamic";

const BODY_LIMIT = 100000;

const RESPONSE_HEADERS = { "cache-control": "private, no-store", vary: "Cookie" };

const problem = (code: string, status: number, stage = "request") =>
  Response.json({ error: { code, status } }, { status, headers: { ...RESPONSE_HEADERS, "x-dojang-companion-error-stage": stage } });

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

// The body, if it's exactly an AgentQuestion within the limits
function readQuestion(body: unknown): AgentRequest | null {
  if (!isObject(body) || Object.keys(body).sort().join() !== "focusKey,history,question") return null;
  const { focusKey, question, history } = body;
  if (typeof focusKey !== "string" || !/^[a-z-]{1,40}(:[A-Za-z0-9_-]{1,40})?$/.test(focusKey)) return null;
  if (typeof question !== "string" || !question.trim() || question.length > QUESTION_LIMIT) return null;
  if (!Array.isArray(history) || history.length > HISTORY_LIMIT) return null;

  const entries: AgentHistoryEntry[] = [];
  for (const entry of history) {
    if (!isObject(entry) || Object.keys(entry).sort().join() !== "role,text") return null;
    if (entry.role !== "staff" && entry.role !== "agent") return null;
    if (typeof entry.text !== "string" || entry.text.length > HISTORY_TEXT_LIMIT) return null;
    entries.push({ role: entry.role, text: entry.text });
  }
  return { focusKey, question: question.trim(), history: entries };
}

export async function POST(request: Request) {
  // Only this app's own pages
  if (request.headers.get("origin") !== new URL(request.url).origin) return problem("FORBIDDEN", 403);

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > BODY_LIMIT) return problem("INVALID_COMMAND", 400);
    body = JSON.parse(text);
  } catch {
    return problem("INVALID_COMMAND", 400);
  }
  const question = readQuestion(body);
  if (!question) return problem("INVALID_COMMAND", 400);

  // Validate the sealed staff session before constructing/invoking the adapter.
  const staff = await requireHubStaff();
  if (!staff.ok) return problem(staff.code, staff.status, "authentication");
  const provider = agentProvider(staff.read);
  const answer = await provider.answer(question);
  if (!answer.ok) return problem(answer.code, answer.status, answer.stage);
  const events: AgentStreamEvent[] = [
    { event: "meta", provider: provider.id, focus: answer.result.focus, mode: answer.result.mode },
    { event: "token", text: answer.result.answer },
    { event: "done" },
  ];
  return new Response(events.map(streamEventText).join(""), {
    headers: {
      ...RESPONSE_HEADERS,
      "content-type": "text/event-stream; charset=utf-8",
      "x-accel-buffering": "no",
    },
  });
}
