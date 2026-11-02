"use client";

import { useEffect, useRef, useState } from "react";
import { useStaffSessionReset } from "@/views/shell/staffSession";
import { useMarkSignedOut } from "@/views/shell/staffConnection";
import { useRouter } from "next/navigation";
import type { CompanionContext, Suggestion } from "@/domain/companion";
import {
  answerFromRecords,
  explainAgentError,
  QUICK_ASKS,
  readStreamEvents,
  type AgentQuestion,
  type AgentTurn,
  type QuickAsk,
} from "@/domain/companionAgent";

/*
   One conversation with the Companion agent, for one rail focus. Adapted from
   Roster 1.0.0 components/agents/test-chat.tsx (docs/LICENSE-MAP.md): the turn
   list, an empty agent turn that fills as tokens arrive, abort when the rail
   goes away, and the honest endings (an error, "stopped early", "connection
   dropped") instead of a half answer that looks finished.

   The rail mounts it with key={focusKey}, so a different record, sign-out
   (doForMeProvider reset) or closing the rail starts with nothing: no turn
   about one record is ever shown on another.
*/

// The code in the server's { error: { code } }, or UNKNOWN
function errorCode(data: unknown): string {
  if (!data || typeof data !== "object" || !("error" in data)) return "UNKNOWN";
  const error = data.error;
  if (!error || typeof error !== "object" || !("code" in error)) return "UNKNOWN";
  return typeof error.code === "string" ? error.code : "UNKNOWN";
}

export function useAgentConversation(focusKey: string) {
  const resetStaffSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();
  const router = useRouter();
  const [turns, setTurns] = useState<AgentTurn[]>([]);
  const [waiting, setWaiting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Leaving must stop the request, not stream into a component that's gone
  useEffect(() => () => abortRef.current?.abort(), []);

  // Changes the last turn (the agent turn being filled)
  function updateLast(change: (last: AgentTurn) => AgentTurn) {
    setTurns((previous) => {
      if (previous.length === 0) return previous;
      const next = [...previous];
      next[next.length - 1] = change(next[next.length - 1]);
      return next;
    });
  }

  function failLast(code: string, stage?: string | null) {
    updateLast((last) => ({ ...last, error: explainAgentError(code, stage) }));
  }

  // A quick ask: answered from the page's records, in the browser
  function askFromRecords(ask: QuickAsk, context: CompanionContext, picked: Suggestion | null) {
    if (waiting) return;
    const question = QUICK_ASKS.find((item) => item.id === ask)?.question ?? ask;
    setTurns((previous) => [...previous, { role: "staff", text: question }, answerFromRecords(ask, context, picked)]);
  }

  // A typed question: sent to the server's agent provider
  async function ask(question: string) {
    const text = question.trim();
    if (!text || waiting) return;

    // Jodi answers independently: don't send earlier answers or record facts.
    const body: AgentQuestion = { focusKey, question: text, history: [] };

    const controller = new AbortController();
    abortRef.current = controller;
    setTurns((previous) => [...previous, { role: "staff", text }, { role: "agent", source: "agent", text: "" }]);
    setWaiting(true);

    let finished = false;
    try {
      const response = await fetch("/api/companion/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      // Not a stream: the server's { error: { code } }
      if (!response.ok || !response.body) {
        const data: unknown = await response.json().catch(() => null);
        finished = true;
        const code = errorCode(data);
        if (code === "SIGN_IN_REQUIRED" || code === "UNAUTHENTICATED") {
          resetStaffSession();
          markSignedOut();
          router.refresh();
          return;
        }
        failLast(code, response.headers.get("x-dojang-companion-error-stage"));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { events, rest } = readStreamEvents(buffer);
        buffer = rest;
        for (const event of events) {
          if (event.event === "meta") {
            updateLast((last) => ({ ...last, focus: event.focus, mode: event.mode }));
          }
          if (event.event === "token") {
            updateLast((last) => ({ ...last, text: last.text + event.text }));
          }
          if (event.event === "error") {
            finished = true;
            failLast(event.code);
          }
          if (event.event === "done") finished = true;
        }
      }
    } catch {
      if (!controller.signal.aborted) {
        finished = true;
        failLast("CONNECTION_DROPPED");
      }
    } finally {
      if (!controller.signal.aborted) {
        // An answer that ends without "done" is cut off; say so rather than
        // leaving half a sentence that reads as finished
        if (!finished) failLast("STOPPED_EARLY");
        setWaiting(false);
        abortRef.current = null;
      }
    }
  }

  function clear() {
    abortRef.current?.abort();
    abortRef.current = null;
    setWaiting(false);
    setTurns([]);
  }

  return { turns, waiting, ask, askFromRecords, clear };
}
