"use client";

import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Suggestion } from "@/domain/companion";
import type { Lead } from "@/domain/lead";
import {
  explainHubError,
  newRequestKey,
  type PrepareLeadActionPayload,
  type PrepareLeadActionResult,
} from "@/domain/hubAction";
import { prepareLeadAction } from "@/integrations/hub";

/*
   Do For Me's review for a lead follow-up, in the centre of Lead Detail (Jodi's
   19 Oct spec: review and Apply on the page, evidence in the rail). Apply sends
   the Hub's prepare_lead_action with kind "follow_up": one internal task on the
   lead. Nothing is sent to the lead; that stays true in every state below.

   States, as Companion's approvals: review -> pending -> done (the page shows the
   result) | conflict (the lead changed) | failed (the Hub said no; nothing
   changed) | notConfirmed (no answer; may have saved, so "Try again" resends the
   same request key and the Hub replays the first save instead of making two).
*/

type Status = "review" | "pending" | "conflict" | "failed" | "notConfirmed";

const NOTHING_SENT = "No message is sent to the lead. This only creates an internal task for staff.";

const cardLabel =
  "mb-2 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em]";
const field =
  "w-full rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 py-2 text-[13px] text-(--crm-text) focus:border-(--crm-muted) focus:outline-none";
const secondaryButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted) disabled:opacity-50";
const primaryButton =
  "inline-flex h-8 items-center rounded-lg bg-(--crm-brand) px-3 text-[12px] font-bold text-white disabled:opacity-50";

// Tomorrow in the viewer's time zone, "2026-10-28"
function tomorrow() {
  const day = new Date();
  day.setDate(day.getDate() + 1);
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${date}`;
}

function Facts({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className="mb-4">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex items-start justify-between gap-4 border-b border-(--crm-line) py-2 text-[12px] last:border-b-0"
        >
          <dt className="text-(--crm-text-secondary)">{fact.label}</dt>
          <dd className="text-right font-bold text-(--crm-text)">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// The page shows this after a successful Apply (it outlives the review)
export function FollowUpPrepared({
  result,
  onClose,
}: {
  result: PrepareLeadActionResult;
  onClose: () => void;
}) {
  return (
    <section
      role="status"
      aria-label="Follow-up prepared"
      className="mb-6 rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5"
    >
      <span className={`${cardLabel} text-(--crm-agent)`}>Do For Me · Done</span>
      <p className="text-[15px] font-bold text-(--crm-text)">Follow-up task prepared</p>
      <p className="mt-1 text-[12px] leading-relaxed text-(--crm-text-secondary)">
        Task #{result.taskId} was added to this lead and shows under Next action.
        No message was sent; the stage, bookings and membership are unchanged.
        {result.replayed && " This repeated an earlier save, so nothing was created twice."}
      </p>
      <button type="button" onClick={onClose} className={`${secondaryButton} mt-4`}>
        Close
      </button>
    </section>
  );
}

export default function FollowUpReview({
  lead,
  suggestion,
  onDone,
  onCancel,
  onReload,
}: {
  lead: Lead;
  suggestion: Suggestion;
  onDone: (result: PrepareLeadActionResult) => void;
  onCancel: () => void;
  onReload: () => void; // fetch the lead again (after a conflict)
}) {
  const [reason, setReason] = useState(suggestion.explanation.slice(0, 800));
  const [due, setDue] = useState(tomorrow);
  const [status, setStatus] = useState<Status>("review");
  const [errorCode, setErrorCode] = useState("");
  // One key per attempt; kept only while the result is unconfirmed
  const requestKey = useRef<string | null>(null);

  // The request sent with that key. A retry after an unconfirmed result resends
  // exactly this, so the Hub can replay its first save instead of making a
  // second task (a changed request under the same key would be refused).
  const sentPayload = useRef<PrepareLeadActionPayload | null>(null);

  const reasonValid = reason.trim().length >= 1 && reason.trim().length <= 800;
  const dueValid = /^\d{4}-\d{2}-\d{2}$/.test(due);
  const pending = status === "pending";
  // Reason and due can't change while a request may already be saved
  const locked = pending || status === "notConfirmed";

  async function apply() {
    if (!requestKey.current || !sentPayload.current) {
      requestKey.current = newRequestKey();
      sentPayload.current = {
        leadId: lead.id,
        // The version this page shows. If someone changed the lead since, the Hub
        // answers VERSION_CONFLICT and nothing is saved.
        expectedVersion: lead.version,
        kind: "follow_up",
        reason: reason.trim(),
        due,
      };
    }
    setStatus("pending");
    const answer = await prepareLeadAction(sentPayload.current, requestKey.current);

    if (answer.outcome === "done") {
      requestKey.current = null;
      sentPayload.current = null;
      onDone(answer.result);
      return;
    }
    if (answer.outcome === "notConfirmed") {
      setStatus("notConfirmed"); // keep the key and request: the retry must be the same
      return;
    }
    requestKey.current = null; // a definite "no": a new try is a new request
    sentPayload.current = null;
    setErrorCode(answer.code);
    setStatus(answer.code === "VERSION_CONFLICT" ? "conflict" : "failed");
  }

  function reload() {
    onReload();
    setStatus("review");
  }

  // A proposal from a fixed Odoo rule (domain/leadFollowUp.ts), not AI
  const fixedRule = suggestion.basis === "rule";

  // What will change, with the due date staff chose
  const preview = [
    ...suggestion.preview.filter((row) => row.label !== "Due"),
    { label: "Due", value: dueValid ? due : "Choose a date" },
  ];

  return (
    <section
      aria-label="Review follow-up"
      className={`mb-6 rounded-xl border bg-(--crm-panel) p-5 ${
        fixedRule ? "border-(--crm-line)" : "border-(--crm-agent)/50"
      }`}
    >
      {/* A fixed rule gets no AI styling (no ✦, no AI colour) and says what it is */}
      {fixedRule ? (
        <span className={`${cardLabel} text-(--crm-muted)`}>
          Do For Me · Review before saving · Fixed Odoo rule · Not AI
        </span>
      ) : (
        <span className={`${cardLabel} flex items-center gap-1.5 text-(--crm-agent)`}>
          <Sparkles size={11} aria-hidden="true" />
          Do For Me · Review before saving
        </span>
      )}
      <h2 className="text-[15px] font-bold text-(--crm-text)">{suggestion.title}</h2>
      <p className="mt-1 mb-4 text-[12px] leading-relaxed text-(--crm-text-secondary)">
        {suggestion.explanation}
      </p>

      <span className={`${cardLabel} text-(--crm-muted)`}>What will change</span>
      <Facts facts={preview} />

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="text-[12px] text-(--crm-text-secondary)">
          Reason (saved as the task&apos;s note)
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={800}
            rows={3}
            disabled={locked}
            className={`${field} mt-1 resize-y`}
          />
        </label>
        <label className="text-[12px] text-(--crm-text-secondary)">
          Due
          <input
            type="date"
            value={due}
            onChange={(event) => setDue(event.target.value)}
            disabled={locked}
            className={`${field} mt-1`}
          />
        </label>
      </div>

      <p className="mb-4 rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 py-2 text-[12px] text-(--crm-text-secondary)">
        {NOTHING_SENT}
      </p>

      {/* The answer, announced to screen readers */}
      <div role="status" className="text-[12px]">
        {pending && <p className="mb-3 text-(--crm-text-secondary)">Saving…</p>}
        {status === "conflict" && (
          <p className="mb-3 text-(--crm-brand)">
            {explainHubError("VERSION_CONFLICT")} Nothing was saved.
          </p>
        )}
        {status === "failed" && (
          <p className="mb-3 text-(--crm-brand)">
            {explainHubError(errorCode)} Nothing was saved.
          </p>
        )}
        {status === "notConfirmed" && (
          <p className="mb-3 text-(--crm-text)">
            No answer came back, so the task may or may not have been saved. Try again
            sends the same request (the reason and due date stay as they were): if it
            was saved, nothing is created twice.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Not while unconfirmed: closing the review would drop the request key,
            and reopening it would send a new one (a second task if the first saved) */}
        <button type="button" onClick={onCancel} disabled={locked} className={secondaryButton}>
          Cancel
        </button>
        {status === "conflict" ? (
          <button type="button" onClick={reload} className={secondaryButton}>
            Reload lead
          </button>
        ) : (
          <button
            type="button"
            onClick={apply}
            disabled={pending || !reasonValid || !dueValid}
            className={primaryButton}
          >
            {status === "notConfirmed" || status === "failed" ? "Try again" : suggestion.actionLabel}
          </button>
        )}
      </div>
    </section>
  );
}
