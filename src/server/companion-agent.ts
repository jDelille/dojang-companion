import type { AgentHistoryEntry } from "@/domain/companionAgent";
import { companionAnswerFrom, companionPayloadFor, type CompanionAnswer } from "@/domain/companionHub";
import type { HubStaffRead } from "@/server/hub-gateway";
import type { CompletionAdapter } from "@/server/ai/adapter";

/*
   The Companion agent's provider: who answers a typed question in the Do For
   Me rail. SERVER ONLY (app/api/companion/ask/route.ts).

   Adapted from Roster 1.0.0 lib/ai/adapter.ts (AiProviderAdapter) and
   lib/ai/index.ts. Roster's providers call Claude/OpenAI directly with a
   workspace's own key and build the prompt from Prisma records; DreamOS does
   neither. The agent's facts, policy (site.ai_enabled), model, cost and audit
   belong to the Hub/Odoo, and it must answer as the signed-in staff member.

   The verified companion_ask read answers whole, from scoped Odoo facts.
   Only an already-authenticated server reader can be passed to this adapter.
   History is not in the verified Hub payload and is deliberately not forwarded.
*/

export type AgentRequest = {
  focusKey: string;
  question: string;
  history: AgentHistoryEntry[];
};

export type AgentAnswer = { ok: true; result: CompanionAnswer } | { ok: false; code: string; status: number; stage: "focus" | "hub" | "response" };

export function agentProvider(read: HubStaffRead): CompletionAdapter<AgentRequest, AgentAnswer> & {
  answer: (request: AgentRequest) => Promise<AgentAnswer>;
} {
  const complete = async (request: AgentRequest): Promise<AgentAnswer> => {
    const mapped = companionPayloadFor(request.focusKey, request.question);
    if (!mapped.ok) return { ...mapped, stage: "focus" };
    const answer = await read("companion_ask", mapped.payload);
    if (!answer.ok) return { ...answer, stage: "hub" };
    const result = companionAnswerFrom(answer.result, mapped.payload);
    return result ? { ok: true, result } : { ok: false, code: "HUB_RESPONSE_UNREADABLE", status: 503, stage: "response" };
  };
  return { id: "hub", complete, answer: complete };
}
