"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Send, Sparkles, User } from "lucide-react";
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
import { SIGN_IN_CODES, runInboxAction } from "@/integrations/hub";
import {
  PREPARE_REPLY_CAPABILITY,
  REVIEW_REPLY_CAPABILITY,
  deliveryMeaning,
  deliveryOf,
  memberName,
  senderName,
  sessionOf,
} from "./inboxCompanion";
import { TimeLabel } from "@/views/crm/localTime";
import { Badge } from "@/templates/roster/components/ui/data";
import { Button } from "@/templates/roster/components/ui/button";
import { Select, Textarea } from "@/templates/roster/components/ui/form";
import { cn } from "@/templates/roster/lib/utils";

/*
   One inbox message (CRM screen C05), the centre of the inbox, as Roster's
   chat pane (licensed Roster 1.0.0 components/inbox/inbox-client.tsx,
   docs/LICENSE-MAP.md): header, the conversation, and a composer at the bottom.

   The conversation is only messages: the guardian's message, and once a reply
   is approved, that reply on the right with its delivery state. The Hub has no
   thread, so there is one inbound message per work item.

   Companion's Hub workflow (1cab554b app/(companion)/hub/page.tsx MessageCard)
   lives in the composer area, one step at a time:
     received  -> pick student and class, "Confirm"   resolve
     resolved  -> "Draft reply"                       draft (template while AI is off)
     drafted   -> the draft as a "Companion suggestion" in the conversation,
                  with Send and Edit (the WhatsMax writeup's Inbox: "Companion
                  suggestion ... [Send] [Edit]"). Edit puts it in the composer;
                  staff can also write their own. Send -> confirm dialog
                                                      approve_reply (needs outbound)
   Approving only queues the reply in the Hub's outbox; Odoo's delivery worker
   checks the approval again and sends it through WhatsMax. The instructor
   summary and the Hub's reasoning are in the Do For Me rail, not the chat.

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
  "Odoo hasn't confirmed the result. Retry this same action to check it; don't start a new one.";

const secondaryButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted) disabled:opacity-50";
const primaryButton =
  "inline-flex h-8 items-center rounded-lg bg-(--crm-brand) px-3 text-[12px] font-bold text-white disabled:opacity-50";

// "Today, 5:45 PM" in the viewer's time zone (only rendered in the browser)
function classTime(iso: string | null) {
  if (!iso) return "";
  const time = new Date(iso);
  const clock = time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (time.toDateString() === new Date().toDateString()) return `Today, ${clock}`;
  return `${time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}, ${clock}`;
}

// The Hub's draft mode, shortened for the suggestion bubble. Its two known
// values (service.py _draft / _followup_draft); anything else is shown as sent.
function draftLabel(mode: string) {
  if (mode === "AI-assisted draft - human review required") return "AI draft · review before sending";
  if (mode === "Template draft - AI disabled") return "Template draft · review before sending";
  return mode;
}

function successText(command: Command, state: string | undefined, simulated: boolean, replayed: boolean) {
  const again = replayed ? " (the original result; nothing was done twice)" : "";
  if (command.operation === "resolve") return `Student and class confirmed${again}.`;
  const where = simulated ? "the simulated outbox (no provider contacted)" : "the outbox";
  return `Reply approved and ${state ?? "queued"} in ${where}${again}.`;
}

export default function MessageView({
  context,
  message,
  simulated,
  picked,
  onChanged,
  onSettled,
  onLockChange,
  onReceipt,
  onDirtyChange,
  externalLocked,
  onAuthenticationLost,
}: {
  context: HubContext;
  message: HubMessage;
  simulated: boolean;
  picked: Suggestion | null; // a Do For Me suggestion for this message, if picked in the rail
  onChanged: () => Promise<void>; // read the inbox again
  onLockChange: (locked: boolean) => void;
  onReceipt: (text: string) => void;
  onDirtyChange: (dirty: boolean) => void;
  externalLocked: boolean;
  onAuthenticationLost: () => void;
  onSettled: () => void; // the picked suggestion has been dealt with
}) {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [unconfirmed, setUnconfirmed] = useState<Command | null>(null);
  const [memberId, setMemberId] = useState(message.memberId ?? "");
  const [sessionId, setSessionId] = useState(message.sessionId ?? "");
  // The reply staff are writing, tied to the revision it was written for, so a
  // new draft (a new revision) starts from an empty composer
  const [written, setWritten] = useState({ revision: message.revision, text: "" });
  const replyText = written.revision === message.revision ? written.text : "";
  const [confirmText, setConfirmText] = useState<string | null>(null); // the reply waiting for "Approve and send"
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const delivery = deliveryOf(context, message.id);
  const student = memberName(context, message.memberId);
  const session = sessionOf(context, message.sessionId);
  const channel = CHANNEL_LABELS[message.channel] ?? message.channel;
  const locked = busy || unconfirmed !== null || externalLocked;
  const dirty = !delivery && replyText.length > 0;
  const prepareHighlighted = picked?.capability === PREPARE_REPLY_CAPABILITY;
  const reviewHighlighted = picked?.capability === REVIEW_REPLY_CAPABILITY;
  const outboundReady = context.capabilities.outbound !== "not_configured";
  const canAct = ["owner", "manager", "instructor"].includes(context.principal.role);
  const canSend = canAct && outboundReady && !locked;
  useEffect(() => { onLockChange(busy || unconfirmed !== null || confirmText !== null); }, [busy, unconfirmed, confirmText, onLockChange]);
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);

  function setReplyText(text: string) {
    setWritten({ revision: message.revision, text });
  }
  function editSuggestion() {
    setReplyText(message.reply);
    composerRef.current?.focus();
  }

  // Do For Me pointed at the reply: bring the composer into view
  useEffect(() => {
    if (reviewHighlighted) composerRef.current?.focus({ preventScroll: false });
  }, [reviewHighlighted]);
  const className = session
    ? `${session.title} · ${classTime(session.startsAt)}`
    : message.sessionId
      ? `Class #${message.sessionId}`
      : null;

  async function execute(command: Command) {
    if (inFlight.current || externalLocked || !canAct || (unconfirmed && command !== unconfirmed)) return;
    inFlight.current = true;
    onLockChange(true);
    setBusy(true);
    setFeedback(null);
    let answer;
    if (command.operation === "resolve") answer = await runInboxAction("resolve", command.payload, command.key);
    else if (command.operation === "draft") answer = await runInboxAction("draft", command.payload, command.key);
    else answer = await runInboxAction("approve_reply", command.payload, command.key);
    inFlight.current = false;
    setBusy(false);

    if (answer.outcome === "notConfirmed") {
      setUnconfirmed(command);
      setFeedback({ kind: "notConfirmed", text: NOT_CONFIRMED_TEXT });
      return;
    }
    setUnconfirmed(null);
    onLockChange(false);
    if (answer.outcome === "failed") {
      if (SIGN_IN_CODES.includes(answer.code)) { onAuthenticationLost(); return; }
      const conflict = answer.code === "VERSION_CONFLICT";
      setFeedback({
        kind: conflict ? "conflict" : "error",
        text: conflict
          ? "This message changed since you opened it. Nothing was saved. Reload and review it again."
          : `${explainHubError(answer.code)} Nothing was saved.`,
      });
      return;
    }
    if (command.operation !== 'resolve' && (answer.result.memberId !== message.memberId || answer.result.sessionId !== message.sessionId)) {
      setUnconfirmed(command); onLockChange(true);
      setFeedback({ kind: 'notConfirmed', text: NOT_CONFIRMED_TEXT }); return;
    }
    setWritten({ revision: message.revision, text: "" });
    onDirtyChange(false);
    const result = answer.result as { state?: string; replayed: boolean };
    // A new draft speaks for itself (it appears in the suggestion bubble), so no
    // "Reply drafted" note. Confirming a student and approving a reply still say so.
    if (command.operation !== "draft") {
      const receiptText = successText(command, result.state, simulated, result.replayed);
      setFeedback({ kind: "success", text: receiptText });
      onReceipt(`Message #${message.id}: ${receiptText}${'deliveryId' in answer.result ? ` Delivery #${answer.result.deliveryId}.` : ''}`);
    }
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
    <article className="inbox-message flex min-h-0 flex-1 flex-col" data-message-id={message.id}>
      {/* Header (Roster): who, link to the record, one line of context */}
      <header className="inbox-message-header flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 tabIndex={-1} className="truncate text-sm font-medium">{senderName(message)}</h2>
            {message.memberId && (
              <Link
                href={`/people/${message.memberId}`}
                title="Open the student's record"
                className="rounded-md p-1 muted transition-colors hover:text-[color:var(--color-fg)]"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">Open {student}&apos;s record</span>
              </Link>
            )}
          </div>
          <p className="truncate text-xs muted">
            {channel} · {message.contactRef}
            {student && ` · ${student}`}
            {className && ` · ${className}`}
          </p>
        </div>
        <Badge tone={delivery ? "neutral" : message.state === "resolved" ? "info" : "warning"}>
          {delivery ? DELIVERY_LABELS[delivery.state] : MESSAGE_STATE_LABELS[message.state]}
        </Badge>
      </header>

      {/* The conversation: messages only */}
      <div className="inbox-message-scroll scrollbar-thin flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <div className="flex gap-2.5">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)]"
          >
            <User className="h-3 w-3" strokeWidth={1.75} />
          </span>
          <div className="inbox-bubble-wrap max-w-[75%]">
            <div className="inline-block whitespace-pre-wrap rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-start text-sm leading-relaxed">
              {message.text}
            </div>
            <p className="mt-1 text-[11px] muted">
              {senderName(message)} · {channel}
            </p>
          </div>
        </div>

        {/* Companion suggestion (the WhatsMax writeup): the Hub's draft reply,
            with Send and Edit. Not sent until staff approve it. */}
        {!delivery && message.reply && (
          <div className="flex flex-row-reverse gap-2.5" aria-label="Companion suggestion" role="group">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] muted"
            >
              <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            </span>
            <div className="inbox-bubble-wrap max-w-[75%] text-end">
              <div className="inline-block rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-start text-sm leading-relaxed">
                <p className="mb-1 text-[11px] font-medium muted">Companion suggestion</p>
                <p className="whitespace-pre-wrap">{message.reply}</p>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-end gap-1.5">
                <Button variant="primary" size="sm" disabled={!canSend || (dirty && !replyText.trim())} onClick={() => setConfirmText(dirty ? replyText.trim() : message.reply)}>
                  <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {dirty ? "Review edited reply" : "Review reply"}
                </Button>
                <Button size="sm" disabled={locked || !canAct || dirty} onClick={editSuggestion}>
                  Edit
                </Button>
              </div>
              <p className="mt-1 text-[11px] muted">{draftLabel(message.mode)}</p>
            </div>
          </div>
        )}

        {/* The approved reply (Roster's outbound bubble). The Hub's read doesn't
            return the sent text, so the bubble states the approval, not words. */}
        {delivery && (
          <div className="flex flex-row-reverse gap-2.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)]"
            >
              <Check className="h-3 w-3" strokeWidth={1.75} />
            </span>
            <div className="inbox-bubble-wrap max-w-[75%] text-end">
              <div
                className={cn(
                  "inline-block rounded-lg border px-3 py-2 text-start text-sm leading-relaxed",
                  delivery.state === "failed" || delivery.state === "uncertain"
                    ? "border-[color:var(--color-alert)]/40"
                    : "border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/10",
                )}
              >
                Reply approved by {delivery.approvedBy}
                {delivery.approvedAt && <span className="mt-1 block text-xs muted"><TimeLabel iso={delivery.approvedAt} /></span>}
                <span className="mt-1 block text-xs muted">Delivery #{delivery.id}{delivery.providerRef ? ` / Provider reference ${delivery.providerRef}` : ""}</span>
              </div>
              <p className="mt-1 text-[11px] muted">
                {DELIVERY_LABELS[delivery.state]}
                {simulated && " · simulated"} · {deliveryMeaning(delivery)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Composer area: the one next step, then the reply box */}
      <div className="inbox-composer border-t border-[color:var(--color-border)] p-3">
        <div role="status" aria-live="polite">
          {busy && <p className="mb-2 text-[11px] muted">Saving…</p>}
          {feedback && (
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
              <p
                className={
                  feedback.kind === "success"
                    ? "muted"
                    : feedback.kind === "notConfirmed"
                      ? "text-[color:var(--color-warning)]"
                      : "text-[color:var(--color-alert)]"
                }
              >
                {feedback.text}
              </p>
              {feedback.kind === "notConfirmed" && unconfirmed && (
                <Button size="sm" disabled={busy} onClick={() => execute(unconfirmed)}>
                  Retry this same action
                </Button>
              )}
              {feedback.kind === "conflict" && (
                <Button size="sm" disabled={busy} onClick={() => void onChanged()}>
                  Reload
                </Button>
              )}
            </div>
          )}
        </div>

        {delivery ? (
          <p className="text-[11px] muted">Reply approval recorded. Delivery status is shown above.</p>
        ) : !canAct ? (
          <p className="text-xs muted">Your current role can view this message. Reply actions require an authorized staff grant.</p>
        ) : message.state === "unmatched" || message.state === "received" ? (
          // Step 1: which student and class the message is about
          <div className="flex flex-wrap items-end gap-2" aria-label="Confirm student and class" role="group">
            <Select
              aria-label="Student"
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              disabled={locked || !canAct}
              className="h-8 min-w-40 text-xs"
            >
              <option value="">Which student?</option>
              {context.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Class"
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              disabled={locked || !canAct}
              className="h-8 min-w-48 text-xs"
            >
              <option value="">Which class?</option>
              {context.sessions.map((each) => (
                <option key={each.id} value={each.id}>
                  {each.title} · {classTime(each.startsAt)}
                </option>
              ))}
            </Select>
            <Button variant="primary" size="sm" onClick={resolve} disabled={locked || !memberId || !sessionId}>
              Confirm
            </Button>
            <p className="w-full text-[11px] muted">{message.state === 'unmatched' ? "A manager must first verify this sender's channel on the correct student profile. Selecting a student here does not verify the sender. Odoo checks the verified guardian binding and existing class registration before confirming." : "Confirm who and which class this is about before replying. Odoo checks guardian authority and the student's registration."}</p>
            {memberId && <Link className="text-xs underline" href={`/people/${memberId}`}>Review selected student profile</Link>}
          </div>
        ) : !message.reply ? (
          // Step 2: the Hub drafts the reply
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={draft}
              disabled={locked || !canAct}
              className={prepareHighlighted ? "ring-2 ring-[color:var(--color-accent)]" : undefined}
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              Draft reply
            </Button>
            <p className="text-[11px] muted">
              {context.capabilities.ai === "disabled" ? "AI is off, so the Hub uses its template." : "Drafted by AI for you to review."}
              {" Nothing is sent."}
            </p>
          </div>
        ) : (
          // Step 3: send the suggestion above, or write / edit a reply here
          <>
            {/* Only after typing: throw the local edit away */}
            {dirty && (
              <div className="mb-2 flex justify-end">
                <Button size="sm" disabled={locked} onClick={() => setReplyText('')}>Discard local edit</Button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                ref={composerRef}
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && canSend && replyText.trim()) {
                    event.preventDefault();
                    setConfirmText(replyText.trim());
                  }
                }}
                maxLength={1500}
                disabled={locked || !canAct}
                aria-label={`Reply via ${channel}`}
                aria-describedby={outboundReady ? undefined : `composer-note-${message.id}`}
                placeholder={`Write a reply via ${channel}, or Edit the suggestion…`}
                className="min-h-[60px]"
              />
              <Button
                variant="primary"
                disabled={!canSend || !replyText.trim()}
                aria-label="Review reply for approval"
                onClick={() => setConfirmText(replyText.trim())}
              >
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </div>
            {/* Only when sending is off: says why the send button is disabled */}
            {!outboundReady && (
              <p id={`composer-note-${message.id}`} className="mt-2 text-[11px] muted">
                Outbound messaging isn&apos;t set up for this school yet, so replies can&apos;t be sent. The suggestion is saved.
              </p>
            )}
          </>
        )}
      </div>

      {/* Dialog: the last step before the outbox */}
      <Modal
        open={confirmText !== null}
        onClose={() => setConfirmText(null)}
        title="Approve and queue this reply?"
        boxClassName="glass crm-scope"
        titleClassName="text-base"
        footer={
          <>
            <button type="button" onClick={() => setConfirmText(null)} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const text = confirmText;
                setConfirmText(null);
                if (text && canSend) approve(text);
              }}
              disabled={!canSend}
              className={primaryButton}
            >
              Approve and queue
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-(--crm-text-secondary)">
          To {senderName(message)} by {channel} (contact {message.contactRef}). Odoo checks the approval again before
          WhatsMax sends it. No booking or attendance change is included.
          {simulated && " Development simulation: no provider will be contacted."}
        </p>
        <blockquote className="mt-3 rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 py-2 text-[13px] whitespace-pre-wrap text-(--crm-text)">
          {confirmText}
        </blockquote>
      </Modal>
    </article>
  );
}
