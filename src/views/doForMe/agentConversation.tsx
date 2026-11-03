"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import type { Suggestion } from "@/domain/companion";
import { QUESTION_LIMIT, type AgentTurn } from "@/domain/companionAgent";
import { useAgentConversation } from "./useAgentConversation";
import { companionPayloadFor } from "@/domain/companionHub";
import AgentAnswerContent from "./agentAnswerContent";

/*
   "Ask the agent" at the bottom of the Do For Me rail (Jodi's 19 Oct spec):
   the conversation for the record in focus, quick asks, and the composer.
   Conversation runtime from Roster's test-chat (see useAgentConversation.ts).

   - Typed questions use the authenticated Hub companion_ask read. The returned
     member/site scope is shown explicitly. Lead-aware AI remains unsupported.
   - An answer about a suggestion offers "Review", which opens the same review
     as Do For Me. Nothing is ever applied from the conversation.

   doForMeRail.tsx mounts it with key={focusKey}: a new focus starts empty.
*/

const SOURCE_LABELS = {
  records: "From this page's records · Not AI",
  agent: "Companion agent",
};

const chipButton =
  "inline-flex h-7 items-center rounded-full border border-(--crm-line) px-2.5 text-[11px] font-bold text-(--crm-text-secondary) transition-colors hover:border-(--crm-muted) hover:text-(--crm-text) disabled:opacity-50";

function Turn({ turn, onReview }: { turn: AgentTurn; onReview: (suggestion: Suggestion) => void }) {
  if (turn.role === "staff") {
    return (
      <li className="flex justify-end">
        <p className="max-w-[85%] rounded-xl bg-(--crm-interactive) px-3 py-2 text-[12px] whitespace-pre-wrap text-(--crm-text)">
          {turn.text}
        </p>
      </li>
    );
  }

  const waiting = !turn.text && !turn.error;
  return (
    <li className="rounded-xl border border-(--crm-line) bg-(--crm-raised) px-3 py-2.5 text-[12px]">
      {turn.source && (
        <p className="mb-1 font-(family-name:--crm-font-label) text-[9px] font-bold tracking-[0.14em] text-(--crm-muted) uppercase">
          {SOURCE_LABELS[turn.source]}
        </p>
      )}
      {waiting && <p className="text-(--crm-muted)">Thinking…</p>}
      <AgentAnswerContent turn={turn} />
      {turn.facts && turn.facts.length > 0 && (
        <dl className="mt-2">
          {turn.facts.map((fact) => (
            <div key={fact.label} className="flex items-start justify-between gap-3 border-t border-(--crm-line) py-1.5">
              <dt className="text-(--crm-muted)">{fact.label}</dt>
              <dd className="text-right font-bold text-(--crm-text)">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {turn.error && <p className="mt-1 text-(--crm-warning)">{turn.error}</p>}
      {turn.review && (
        <button type="button" onClick={() => turn.review && onReview(turn.review)} className={`${chipButton} mt-2`}>
          Review {turn.review.actionLabel.toLowerCase()} →
        </button>
      )}
    </li>
  );
}

type Props = {
  focusKey: string;
  onReview: (suggestion: Suggestion) => void;
};

export default function AgentConversation({ focusKey, onReview }: Props) {
  const conversation = useAgentConversation(focusKey);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLLIElement>(null);
  const support = companionPayloadFor(focusKey, "Scope check");

  // Keep the newest turn in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [conversation.turns]);

  function send() {
    const question = draft.trim();
    if (!question || conversation.waiting) return;
    setDraft("");
    void conversation.ask(question);
  }

  return (
    <div className="border-t border-(--crm-line)">
      {conversation.turns.length > 0 && (
        <div className="flex max-h-[45vh] flex-col">
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="font-(family-name:--crm-font-label) text-[10px] font-bold tracking-[0.16em] text-(--crm-agent) uppercase">
              Ask
            </span>
            <button
              type="button"
              onClick={conversation.clear}
              className="text-[11px] text-(--crm-muted) hover:text-(--crm-text)"
            >
              Clear
            </button>
          </div>
          <ul aria-live="polite" className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {conversation.turns.map((turn, index) => (
              <Turn key={index} turn={turn} onReview={onReview} />
            ))}
            <li ref={bottomRef} aria-hidden="true" />
          </ul>
        </div>
      )}

      {support.ok && (
        <p className="px-4 pt-3 text-[10px] text-(--crm-muted)">
          {support.payload.memberId
            ? "Ask about this member’s scoped Odoo facts. No actions are executed."
            : "Answers use site-level Odoo facts, not the selected lead, message or class."}
        </p>
      )}

      <form
        className="p-4 pt-2"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label className="flex items-center gap-2 rounded-xl border border-(--crm-line) bg-(--crm-canvas) py-1.5 pr-1.5 pl-3">
          <span className="sr-only">Ask the agent</span>
          <input
            id="companion-question"
            type="text"
            value={draft}
            maxLength={QUESTION_LIMIT}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask the agent..."
            className="min-w-0 flex-1 bg-transparent text-[12px] text-(--crm-text) placeholder:text-(--crm-muted) focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || conversation.waiting}
            aria-label="Send"
            className="grid size-8 place-items-center rounded-lg bg-(--crm-agent) text-white disabled:opacity-60"
          >
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </label>
      </form>
    </div>
  );
}
