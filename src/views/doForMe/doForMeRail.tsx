"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Sparkles, X } from "lucide-react";
import type { CompanionContext, Suggestion } from "@/domain/companion";
import AgentConversation from "./agentConversation";

/*
   The Do For Me rail (Jodi's mockup, Desktop/inspiration/jodi-1.png and jodi-2.png;
   placed as the full-height right column of Desktop/vercel-design-1.png).
   Behaviour from Companion 1cab554b src/components/shell/rail/companion-rail
   (CompanionRail, MemberIntel, SuggestedCard, WorkTab, EvidenceTab, AgentComposer).
   One rail for the whole Dojang staff layout: doForMeProvider.tsx holds what it's
   focused on and its tab/picked task per focus.

   Plan, Work, Evidence and History show what the context says. A lead's
   follow-up (a fixed Odoo rule) is reviewed and applied on the lead page; a
   suggestion with its own panel (the Inbox's class move) is reviewed and
   applied in Work. "Ask the agent" is
   agentConversation.tsx: quick asks answer from the context (not AI), typed
   questions go to /api/companion/ask, which has no agent connected yet.
*/

export type RailTab = "plan" | "work" | "evidence" | "history";

const TABS: { id: RailTab; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "work", label: "Work" },
  { id: "evidence", label: "Evidence" },
  { id: "history", label: "History" },
];

const RISK_LABELS = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

// The composer with no record in focus: nothing to ask about
const NO_FOCUS = "Open a record to ask about it";

const sectionLabel =
  "mb-2 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em]";

const smallButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted)";

// "2026-10-07T14:14:00Z" -> "2:14 PM", in the viewer's own time zone
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// Label on the left, value on the right, a line under each (intelligence, previews)
function FactList({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className="mb-5">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex items-start justify-between gap-4 border-b border-(--crm-line) py-2.5 text-[12px]"
        >
          <dt className="text-(--crm-text-secondary)">{fact.label}</dt>
          <dd className="text-right font-bold text-(--crm-text)">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SuggestedCard({
  suggestion,
  summary,
  onDoForMe,
}: {
  suggestion: Suggestion;
  summary: string;
  onDoForMe: () => void;
}) {
  const [explainOpen, setExplainOpen] = useState(false);

  return (
    <div className="rounded-xl bg-(--crm-raised) p-4">
      {/* Says when it's a fixed rule over Odoo's records, so it never reads as AI */}
      <p className="text-[12px] text-(--crm-text-secondary)">
        {suggestion.basis === "rule" ? "Fixed Odoo rule · Not AI" : "Suggested"}
      </p>
      <h4 className="mt-1 text-[13px] font-bold text-(--crm-text)">{suggestion.title}</h4>
      <p className="mt-1.5 text-[12px] leading-relaxed text-(--crm-muted)">{summary}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          aria-expanded={explainOpen}
          onClick={() => setExplainOpen((open) => !open)}
          className={smallButton}
        >
          Explain
        </button>
        <button type="button" onClick={onDoForMe} className={smallButton}>
          Do For Me
        </button>
      </div>
      {explainOpen && (
        <p className="mt-3 text-[12px] leading-relaxed text-(--crm-text-secondary)">
          {suggestion.explanation}
        </p>
      )}
    </div>
  );
}

function PlanTab({
  context,
  onDoForMe,
}: {
  context: CompanionContext;
  onDoForMe: (suggestion: Suggestion) => void;
}) {
  const { featured } = context;
  return (
    <>
      <span className={`${sectionLabel} text-(--crm-agent)`}>{context.intelTitle}</span>
      {context.intel.length > 0 && <FactList facts={context.intel} />}

      {/* Records to open (Front Desk's due follow-ups): links, not suggestions */}
      {context.links && context.links.length > 0 && (
        <ul className="mb-5">
          {context.links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 border-b border-(--crm-line) py-3 text-[12px]"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-(--crm-text)">{link.title}</span>
                {link.detail && <span className="block text-[11px] text-(--crm-muted)">{link.detail}</span>}
              </span>
              <Link href={link.href} className="shrink-0 text-(--crm-muted) hover:text-(--crm-text)">
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}

      {context.guidance && (
        <p className="mb-4 rounded-lg border border-(--crm-line) bg-(--crm-raised) px-3 py-2.5 text-[12px] leading-relaxed text-(--crm-text-secondary)">
          {context.guidance}
        </p>
      )}

      {featured && (
        <SuggestedCard
          suggestion={featured.suggestion}
          summary={featured.summary}
          onDoForMe={() => onDoForMe(featured.suggestion)}
        />
      )}
      {!featured && !context.guidance && context.suggestions.length === 0 && (
        <p className="text-[12px] text-(--crm-muted)">No suggestions here yet.</p>
      )}

      {context.suggestions.length > 0 && (
        <ul className="mt-4">
          {context.suggestions.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 border-b border-(--crm-line) py-3 text-[12px]"
            >
              <span className="font-semibold text-(--crm-text)">{task.title}</span>
              <button
                type="button"
                onClick={() => onDoForMe(task)}
                className="text-(--crm-muted) hover:text-(--crm-text)"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// The picked task's review. Apply stays off until approvals are connected.
function WorkTab({
  suggestion,
  onNotNow,
  onWhy,
}: {
  suggestion: Suggestion | null;
  onNotNow: () => void;
  onWhy: () => void;
}) {
  if (!suggestion) {
    return (
      <p className="text-[12px] leading-relaxed text-(--crm-muted)">
        Nothing picked yet. Press Do For Me on a suggestion in Plan.
      </p>
    );
  }

  // The page gave its own review for the rail (its steps, Review and Apply)
  if (suggestion.panel) {
    return <>{suggestion.panel}</>;
  }

  // Reviewed on the page (Jodi's spec): the rail only points there
  if (suggestion.review === "page") {
    return (
      <>
        <h3 className="text-[15px] font-bold leading-snug text-(--crm-text)">{suggestion.title}</h3>
        <p className="mt-2 text-[12px] leading-relaxed text-(--crm-text-secondary)">
          The review is open on the page. Nothing changes until you apply it there.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onWhy} className={smallButton}>
            Why? →
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="mb-3 flex items-center gap-2 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-agent)">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-(--crm-agent)" />
        Waiting for approval
      </p>
      <h3 className="text-[15px] font-bold leading-snug text-(--crm-text)">{suggestion.title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-(--crm-text-secondary)">
        {suggestion.explanation}
      </p>
      <p className="mt-3 inline-block rounded-full border border-(--crm-line) px-2.5 py-0.5 text-[11px] text-(--crm-text-secondary)">
        {RISK_LABELS[suggestion.risk]}
      </p>

      {suggestion.preview.length > 0 && (
        <div className="mt-5">
          <span className={`${sectionLabel} text-(--crm-muted)`}>What will change</span>
          <FactList facts={suggestion.preview} />
        </div>
      )}

      <p role="status" className="mb-4 text-[12px] text-(--crm-muted)">
        No changes have executed.
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onNotNow} className={smallButton}>
          Not now
        </button>
        <button type="button" onClick={onWhy} className={smallButton}>
          Why? →
        </button>
        <button
          type="button"
          disabled
          title="Approval isn't connected yet"
          className="inline-flex h-8 items-center rounded-lg bg-(--crm-brand) px-3 text-[12px] font-bold text-white opacity-50"
        >
          {suggestion.actionLabel}
        </button>
      </div>
    </>
  );
}

function EvidenceTab({ suggestion }: { suggestion: Suggestion | null }) {
  if (!suggestion) {
    return <p className="text-[12px] text-(--crm-muted)">No evidence here yet.</p>;
  }
  return (
    <>
      <span className={`${sectionLabel} text-(--crm-muted)`}>Evidence</span>
      <h3 className="text-[15px] font-bold leading-snug text-(--crm-text)">{suggestion.title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-(--crm-text-secondary)">
        {suggestion.explanation}
      </p>
      {suggestion.evidence && suggestion.evidence.length > 0 && (
        <div className="mt-5">
          <span className={`${sectionLabel} text-(--crm-muted)`}>Based on</span>
          <FactList facts={suggestion.evidence} />
        </div>
      )}
    </>
  );
}

function HistoryTab({ context }: { context: CompanionContext }) {
  if (context.receipts.length === 0) {
    return <p className="text-[12px] text-(--crm-muted)">Nothing has been done here yet.</p>;
  }
  return (
    <ul>
      {context.receipts.map((receipt) => (
        <li key={receipt.id} className="border-b border-(--crm-line) py-2.5 text-[12px] text-(--crm-text-secondary)">
          <span className="font-bold text-(--crm-text)">{formatTime(receipt.at)}</span>{" "}
          {receipt.summary} · {receipt.actor}
        </li>
      ))}
    </ul>
  );
}

type Props = {
  context: CompanionContext | null; // null until a page says what to focus on
  tab: RailTab;
  picked: Suggestion | null; // the task Work and Evidence are about
  onTab: (tab: RailTab) => void;
  onDoForMe: (suggestion: Suggestion) => void;
  onClose: () => void;
  focusKey: string | null; // the focus the conversation belongs to
};

export default function DoForMeRail({ context, tab, picked, onTab, onDoForMe, onClose, focusKey }: Props) {
  // The picked suggestion as the page currently gives it (its panel then has the
  // latest records), or as it was picked once the page no longer offers it
  const livePicked = picked
    ? (context?.suggestions.find((each) => each.id === picked.id) ??
      (context?.featured?.suggestion.id === picked.id ? context.featured.suggestion : null) ??
      picked)
    : null;
  // Evidence is about the picked task, or this focus's top suggestion
  const evidenceFor =
    picked ?? context?.featured?.suggestion ?? context?.suggestions[0] ?? null;

  return (
    <aside
      id="do-for-me-rail"
      aria-label="Do For Me"
      tabIndex={-1}
      className="crm-scope flex min-h-0 min-w-0 flex-col border-t border-(--crm-line) bg-(--crm-canvas) lg:h-full lg:w-[17rem] lg:border-t-0 lg:border-l"
    >
      <header className="flex items-center justify-between gap-2 px-5 pt-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-(--crm-text)">
          <Sparkles size={14} aria-hidden="true" className="text-(--crm-agent)" />
          Do For Me
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Do For Me"
          className="grid size-7 place-items-center rounded-lg text-(--crm-muted) transition-colors hover:bg-(--crm-interactive) hover:text-(--crm-text)"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </header>


      <div
        role="tablist"
        aria-label="Do For Me"
        className="mx-5 mt-4 grid grid-cols-4 border-b border-(--crm-line)"
      >
        {TABS.map((item) => {
          const isActive = item.id === tab;
          return (
            <button
              key={item.id}
              id={`do-for-me-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="do-for-me-panel"
              disabled={!context}
              onClick={() => onTab(item.id)}
              className={`border-b-2 pb-2.5 font-(family-name:--crm-font-label) text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                isActive
                  ? "border-(--crm-agent) text-(--crm-text)"
                  : "border-transparent text-(--crm-muted) hover:text-(--crm-text-secondary)"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id="do-for-me-panel"
        role="tabpanel"
        aria-labelledby={`do-for-me-tab-${tab}`}
        className="flex-1 overflow-y-auto px-5 py-5"
      >
        {!context ? (
          <p className="text-[12px] text-(--crm-muted)">No record in focus.</p>
        ) : (
          <>
            {/* What Do For Me is focused on, as Companion's "Front desk context" line
                (green in the mockup: the context is live) */}
            <p className="mb-4 flex items-center gap-2 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-success)">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-(--crm-success)" />
              <span className="truncate">{context.label}</span>
            </p>
            {tab === "plan" && <PlanTab context={context} onDoForMe={onDoForMe} />}
            {tab === "work" && (
              <WorkTab
                suggestion={livePicked}
                onNotNow={() => onTab("plan")}
                onWhy={() => onTab("evidence")}
              />
            )}
            {tab === "evidence" && <EvidenceTab suggestion={evidenceFor} />}
            {tab === "history" && <HistoryTab context={context} />}
          </>
        )}
      </div>

      {/* "Ask the agent", as in the mockup: the conversation for this focus.
          Keyed by the focus, so another record never shows this one's turns. */}
      {context && focusKey ? (
        <AgentConversation
          key={focusKey}
          focusKey={focusKey}
          onReview={onDoForMe}
        />
      ) : (
        <form className="p-4" onSubmit={(event) => event.preventDefault()}>
          <label className="flex items-center gap-2 rounded-xl border border-(--crm-line) bg-(--crm-canvas) py-1.5 pr-1.5 pl-3">
            <span className="sr-only">Ask the agent</span>
            <input
              type="text"
              disabled
              placeholder="Ask the agent..."
              title={NO_FOCUS}
              className="min-w-0 flex-1 bg-transparent text-[12px] text-(--crm-text) placeholder:text-(--crm-muted) focus:outline-none"
            />
            <button
              type="submit"
              disabled
              aria-label="Send"
              title={NO_FOCUS}
              className="grid size-8 place-items-center rounded-lg bg-(--crm-agent) text-white opacity-60"
            >
              <ArrowUp size={14} aria-hidden="true" />
            </button>
          </label>
        </form>
      )}
    </aside>
  );
}
