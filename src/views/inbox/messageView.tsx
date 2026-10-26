"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";
import Modal from "@/components/common/Modal";
import { explainHubError, newRequestKey } from "@/domain/hubAction";
import {
  CHANNEL_LABELS,
  DELIVERY_LABELS,
  MESSAGE_STATE_LABELS,
  type ApproveReplyPayload,
  type DraftPayload,
  type HubContext,
  type HubMessage,
  type ResolvePayload,
} from "@/domain/inbox";
import type { Suggestion } from "@/domain/companion";
import { runInboxAction } from "@/integrations/hub";
import {
  PREPARE_REPLY_CAPABILITY,
  REVIEW_REPLY_CAPABILITY,
  deliveryMeaning,
  deliveryOf,
  memberName,
  outboundLabel,
  senderName,
  sessionOf,
} from "./inboxCompanion";
import { Badge } from "./inboxStates";

/*
   One inbox message (CRM screen C05), the centre of the inbox.

   Header and inbound bubble adapted from licensed Roster 1.0.0
   components/inbox/inbox-client.tsx (docs/LICENSE-MAP.md). Everything below the
   bubble is Companion's Hub workflow (1cab554b app/(companion)/hub/page.tsx
   MessageCard), through Jodi's Hub operations:
     received  -> "Confirm student and class"  resolve
     resolved  -> "Prepare follow-up"          draft (template while AI is off)
     drafted   -> editable "Review reply" + recipient/channel disclosure
               -> "Approve and queue reply"    approve_reply (needs outbound)
     approved  -> the delivery's state, as the Hub reports it
   Nothing on this screen sends a message. Approving only queues the reply in the
   Hub's outbox; while outbound is not configured it can't even do that.

   Request keys, as Companion: one per action. With no confirmed answer, every
   other action waits and "Retry this same action" resends the same key, so the
   Hub replays the first result instead of doing it twice.
*/

type Command =
  | { operation: "resolve"; payload: ResolvePayload; key: string }
  | { operation: "draft"; payload: DraftPayload; key: string }
  | { operation: "approve_reply"; payload: ApproveReplyPayload; key: string };

type Feedback = { kind: "success" | "error" | "conflict" | "notConfirmed"; text: string };

const NOT_CONFIRMED_TEXT =
  "Odoo has not confirmed the result. Don't start a new action: retry this same action to check its original receipt.";

const field =
  "w-full rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 py-2 text-[13px] text-(--crm-text) focus:border-(--crm-muted) focus:outline-none disabled:opacity-60";
const secondaryButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted) disabled:opacity-50";
const primaryButton =
  "inline-flex h-8 items-center rounded-lg bg-(--crm-brand) px-3 text-[12px] font-bold text-white disabled:opacity-50";
const sectionLabel =
  "mb-2 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

// "Today, 5:45 PM" in the viewer's time zone (only rendered in the browser)
function classTime(iso: string | null) {
  if (!iso) return "";
  const time = new Date(iso);
  const clock = time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (time.toDateString() === new Date().toDateString()) return `Today, ${clock}`;
  return `${time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}, ${clock}`;
}

function successText(command: Command, state: string | undefined, simulated: boolean, replayed: boolean) {
  const again = replayed ? " (This was the original result of the same request; nothing was done twice.)" : "";
  if (command.operation === "resolve") return `Student and class confirmed. Nothing was sent.${again}`;
  if (command.operation === "draft") {
    return `Reply drafted for your review. Nothing was sent.${again}`;
  }
  const where = simulated ? "the simulated development outbox. No provider was contacted" : "the Hub's outbox";
  return `Reply approved and ${state ?? "queued"} in ${where}. It isn't delivered until the provider confirms it.${again}`;
}

// The reviewed reply: its text resets when the message's revision changes
function ReplyReview({
  message,
  context,
  simulated,
  locked,
  highlighted,
  onApprove,
  onRedraft,
}: {
  message: HubMessage;
  context: HubContext;
  simulated: boolean;
  locked: boolean;
  highlighted: boolean;
  onApprove: (reply: string) => void;
  onRedraft: () => void;
}) {
  const [reply, setReply] = useState(message.reply);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const outboundReady = context.capabilities.outbound !== "not_configured";
  const channel = CHANNEL_LABELS[message.channel] ?? message.channel;

  // Do For Me pointed here: bring the reply into view
  useEffect(() => {
    if (highlighted) ref.current?.focus({ preventScroll: false });
  }, [highlighted]);

  return (
    <section
      aria-label="Review reply"
      className={`rounded-xl border bg-(--crm-panel) p-5 ${highlighted ? "border-(--crm-agent)/60" : "border-(--crm-line)"}`}
    >
      {message.summary && (
        <>
          <span className={sectionLabel}>Instructor summary</span>
          <p className="text-[12px] leading-relaxed text-(--crm-text-secondary)">{message.summary}</p>
        </>
      )}
      <p className="mt-2 mb-4 text-[11px] text-(--crm-muted)">{message.mode}</p>

      <label className="block text-[12px] text-(--crm-text-secondary)">
        Review reply
        <textarea
          ref={ref}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          maxLength={1500}
          rows={4}
          disabled={locked}
          className={`${field} mt-1 resize-y`}
        />
      </label>

      {/* Recipient and channel disclosure (Companion's wording) */}
      <p className="mt-3 flex gap-2 rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 py-2 text-[12px] leading-relaxed text-(--crm-text-secondary)">
        <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          Recipient: <strong className="text-(--crm-text)">{senderName(message)}</strong> · {channel} contact{" "}
          {message.contactRef}. Approving queues this reply on the verified channel; nothing is sent from this
          screen. No booking or attendance change is included.
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onRedraft} disabled={locked} className={secondaryButton}>
          Regenerate draft
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={locked || !outboundReady || !reply.trim()}
          className={primaryButton}
        >
          Approve and queue reply
        </button>
      </div>
      {!outboundReady && (
        <p className="mt-2 text-[12px] text-(--crm-warning)">
          {explainHubError("PROVIDER_NOT_CONFIGURED")} Outbound messaging is not configured for this school
          (Hub capability: not_configured), so a reply can't be queued.
        </p>
      )}
      {outboundReady && simulated && (
        <p className="mt-2 text-[12px] text-(--crm-agent)">
          Development simulation: approving queues the reply in a simulated outbox. No provider is contacted.
        </p>
      )}

      {/* Dialog: the last step before the outbox */}
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Approve and queue this reply?"
        boxClassName="glass crm-scope"
        titleClassName="text-base"
        footer={
          <>
            <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onApprove(reply.trim());
              }}
              className={primaryButton}
            >
              Approve and queue reply
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-(--crm-text-secondary)">
          It goes into the Hub&apos;s outbox for {senderName(message)} ({channel}). The Hub checks the approval
          again before anything is sent.
          {simulated && " This is the development simulation: no provider will be contacted."}
        </p>
        <blockquote className="mt-3 rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 py-2 text-[13px] whitespace-pre-wrap text-(--crm-text)">
          {reply.trim()}
        </blockquote>
      </Modal>
    </section>
  );
}

export default function MessageView({
  context,
  message,
  simulated,
  readOnly,
  picked,
  onChanged,
  onSettled,
}: {
  context: HubContext;
  message: HubMessage;
  simulated: boolean;
  readOnly: boolean; // the real Hub: show the message, offer no actions
  picked: Suggestion | null; // a Do For Me suggestion for this message, if picked in the rail
  onChanged: () => Promise<void>; // read the inbox again
  onSettled: () => void; // the picked suggestion has been dealt with
}) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [unconfirmed, setUnconfirmed] = useState<Command | null>(null);
  const [memberId, setMemberId] = useState(message.memberId ?? "");
  const [sessionId, setSessionId] = useState(message.sessionId ?? "");

  const delivery = deliveryOf(context, message.id);
  const student = memberName(context, message.memberId);
  const session = sessionOf(context, message.sessionId);
  const channel = CHANNEL_LABELS[message.channel] ?? message.channel;
  const locked = busy || unconfirmed !== null;
  const prepareHighlighted = picked?.capability === PREPARE_REPLY_CAPABILITY;
  const reviewHighlighted = picked?.capability === REVIEW_REPLY_CAPABILITY;

  async function execute(command: Command) {
    setBusy(true);
    setFeedback(null);
    let answer;
    if (command.operation === "resolve") answer = await runInboxAction("resolve", command.payload, command.key);
    else if (command.operation === "draft") answer = await runInboxAction("draft", command.payload, command.key);
    else answer = await runInboxAction("approve_reply", command.payload, command.key);
    setBusy(false);

    if (answer.outcome === "notConfirmed") {
      setUnconfirmed(command);
      setFeedback({ kind: "notConfirmed", text: NOT_CONFIRMED_TEXT });
      return;
    }
    setUnconfirmed(null);
    if (answer.outcome === "failed") {
      const conflict = answer.code === "VERSION_CONFLICT";
      setFeedback({
        kind: conflict ? "conflict" : "error",
        text: conflict
          ? "This message changed since you opened it. Nothing was saved. Reload and review it again."
          : `${explainHubError(answer.code)} Nothing was saved.`,
      });
      return;
    }
    const result = answer.result as { state?: string; replayed: boolean };
    setFeedback({ kind: "success", text: successText(command, result.state, simulated, result.replayed) });
    onSettled();
    await onChanged();
  }

  const resolve = () =>
    execute({
      operation: "resolve",
      payload: { messageId: message.id, memberId, sessionId, expectedRevision: message.revision },
      key: newRequestKey(),
    });
  const draft = () =>
    execute({
      operation: "draft",
      payload: { messageId: message.id, expectedRevision: message.revision },
      key: newRequestKey(),
    });
  const approve = (reply: string) =>
    execute({
      operation: "approve_reply",
      payload: { messageId: message.id, expectedRevision: message.revision, reply },
      key: newRequestKey(),
    });

  return (
    <article className="flex min-h-0 flex-1 flex-col" data-message-id={message.id}>
      {/* Header (Roster): who, link to the record, channel line */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-(--crm-line) px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[15px] font-bold text-(--crm-text)">{senderName(message)}</h2>
            {message.memberId && (
              <Link
                href={`/people/${message.memberId}`}
                title="Open the student's record"
                className="rounded p-1 text-(--crm-muted) hover:text-(--crm-text)"
              >
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only">Open {student}&apos;s record</span>
              </Link>
            )}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-(--crm-text-secondary)">
            {channel} · contact {message.contactRef}
          </p>
        </div>
        <Badge tone={message.state === "resolved" ? "info" : "warning"}>{MESSAGE_STATE_LABELS[message.state]}</Badge>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {/* Attributes */}
        <dl className="grid gap-x-6 gap-y-1 text-[12px] sm:grid-cols-2">
          <div className="flex justify-between gap-4 border-b border-(--crm-line) py-2">
            <dt className="text-(--crm-text-secondary)">Student</dt>
            <dd className={student ? "font-bold text-(--crm-text)" : "text-(--crm-muted)"}>{student ?? "Not confirmed"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-(--crm-line) py-2">
            <dt className="text-(--crm-text-secondary)">Class</dt>
            <dd className={message.sessionId ? "text-right font-bold text-(--crm-text)" : "text-(--crm-muted)"}>
              {session
                ? `${session.title} · ${classTime(session.startsAt)}`
                : message.sessionId
                  ? `Class #${message.sessionId} (no longer listed)`
                  : "Not confirmed"}
            </dd>
          </div>
        </dl>

        {/* The inbound message (Roster's bubble). One message: the Hub has no thread. */}
        <div className="flex gap-2.5">
          <div className="max-w-[85%]">
            <div className="inline-block rounded-2xl border border-(--crm-line) bg-(--crm-canvas) px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-(--crm-text)">
              {message.text}
            </div>
            <p className="mt-1 text-[11px] text-(--crm-muted)">
              {senderName(message)} · {channel} · via WhatsMax
            </p>
          </div>
        </div>

        {/* What staff can do next */}
        {delivery ? (
          <section
            aria-label="Delivery"
            className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5"
          >
            <span className={sectionLabel}>Reply delivery</span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={delivery.state === "failed" || delivery.state === "uncertain" ? "danger" : delivery.state === "delivered" ? "success" : "neutral"}>
                {DELIVERY_LABELS[delivery.state]}
              </Badge>
              {simulated && <Badge tone="agent">Simulated · no provider contacted</Badge>}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-(--crm-text-secondary)">{deliveryMeaning(delivery)}</p>
            <p className="mt-2 text-[11px] text-(--crm-muted)">
              Approved by {delivery.approvedBy}
              {delivery.providerRef ? ` · provider receipt ${delivery.providerRef}` : " · no provider receipt"}
            </p>
          </section>
        ) : message.state === "unmatched" ? (
          <p className="rounded-xl border border-(--crm-warning)/40 bg-(--crm-panel) p-4 text-[12px] leading-relaxed text-(--crm-text-secondary)">
            This sender isn&apos;t a verified guardian. A manager must verify the guardian&apos;s channel in Odoo
            before this message can be resolved, drafted or replied to.
          </p>
        ) : readOnly ? (
          <section aria-label="Read-only" className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5">
            <span className={sectionLabel}>Read-only</span>
            <p className="text-[12px] leading-relaxed text-(--crm-text-secondary)">
              DreamOS reads this message from Odoo but can&apos;t resolve, draft or approve it yet. Use Companion for
              those for now.
            </p>
            {message.reply && (
              <div className="mt-4">
                <span className={sectionLabel}>Drafted reply ({message.mode})</span>
                <p className="rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-(--crm-text)">
                  {message.reply}
                </p>
              </div>
            )}
          </section>
        ) : message.state === "received" ? (
          <section aria-label="Confirm student and class" className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5">
            <span className={sectionLabel}>Which student and class is this about?</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[12px] text-(--crm-text-secondary)">
                Student
                <select value={memberId} onChange={(event) => setMemberId(event.target.value)} disabled={locked} className={`${field} mt-1`}>
                  <option value="">Select student</option>
                  {context.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[12px] text-(--crm-text-secondary)">
                Class
                <select value={sessionId} onChange={(event) => setSessionId(event.target.value)} disabled={locked} className={`${field} mt-1`}>
                  <option value="">Select class</option>
                  {context.sessions.map((each) => (
                    <option key={each.id} value={each.id}>
                      {each.title} · {classTime(each.startsAt)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" onClick={resolve} disabled={locked || !memberId || !sessionId} className={`${primaryButton} mt-4`}>
              Confirm student and class
            </button>
          </section>
        ) : !message.reply ? (
          <section
            aria-label="Prepare follow-up"
            className={`rounded-xl border bg-(--crm-panel) p-5 ${prepareHighlighted ? "border-(--crm-agent)/60" : "border-(--crm-line)"}`}
          >
            <span className={sectionLabel}>Follow-up</span>
            <p className="mb-4 text-[12px] leading-relaxed text-(--crm-text-secondary)">
              Prepare a reply for review. Drafting doesn&apos;t send anything.
              {context.capabilities.ai === "disabled" && " AI drafting is off, so the Hub uses its template."}
            </p>
            <button type="button" onClick={draft} disabled={locked} className={primaryButton}>
              Prepare follow-up
            </button>
          </section>
        ) : (
          <ReplyReview
            key={message.revision}
            message={message}
            context={context}
            simulated={simulated}
            locked={locked}
            highlighted={reviewHighlighted}
            onApprove={approve}
            onRedraft={draft}
          />
        )}

        {/* The answer to the last action */}
        <div role="status" aria-live="polite">
          {busy && <p className="text-[12px] text-(--crm-text-secondary)">Saving…</p>}
          {feedback && (
            <div
              className={`rounded-lg border px-3 py-2 text-[12px] leading-relaxed ${
                feedback.kind === "success"
                  ? "border-(--crm-success)/40 text-(--crm-text)"
                  : feedback.kind === "notConfirmed"
                    ? "border-(--crm-warning)/50 text-(--crm-text)"
                    : "border-(--crm-danger)/50 text-(--crm-text)"
              }`}
            >
              <p>{feedback.text}</p>
              {feedback.kind === "notConfirmed" && unconfirmed && (
                <button type="button" onClick={() => execute(unconfirmed)} disabled={busy} className={`${secondaryButton} mt-2`}>
                  Retry this same action
                </button>
              )}
              {feedback.kind === "conflict" && (
                <button type="button" onClick={() => void onChanged()} disabled={busy} className={`${secondaryButton} mt-2`}>
                  Reload
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-[11px] text-(--crm-muted)">Outbound: {outboundLabel(context, simulated)}</p>
      </div>
    </article>
  );
}
