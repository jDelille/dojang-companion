"use client";

import { useRef, useState } from "react";
import { ArrowDown, Check, CircleAlert, CircleDashed, Loader2, X } from "lucide-react";
import Modal from "@/components/common/Modal";
import { explainHubError, newRequestKey } from "@/domain/hubAction";
import { CHANNEL_LABELS, type HubContext, type HubMessage } from "@/domain/inbox";
import {
  classDay,
  classWhen,
  moveReplyText,
  moveTaskSummary,
  type ChangeClassPayload,
  type CreateTaskPayload,
} from "@/domain/classMove";
import { runInboxAction } from "@/integrations/hub";
import { changeClass, createTask } from "@/integrations/crmWrites";
import { memberName, senderName, sessionOf } from "./inboxCompanion";
import { Button } from "@/templates/roster/components/ui/button";
import { Input, Select, Textarea } from "@/templates/roster/components/ui/form";

/*
   Do For Me's class move for one Inbox message (src/domain/classMove.ts):
     1. Move the student to another class      change_class
     2. Reply to the guardian                   draft (if needed) + approve_reply
     3. Add a follow-up task on the member      create_task (owners and managers)
   Shown in the Do For Me rail's Work tab (the Inbox's "Move to another class"
   suggestion, inboxClient.tsx), so it is laid out for the narrow rail.
   Staff choose the class and can edit the reply and task, then Review -> Apply.
   Apply runs the steps in order. Each step has its own request key, frozen at
   the first Apply, so retrying an unconfirmed step can't do it twice. A failed
   or unconfirmed step stops the plan and says what was done and what wasn't.
*/

type StepKey = "move" | "reply" | "task";
type StepStatus = "waiting" | "running" | "done" | "failed" | "uncertain" | "skipped";
type StepState = { status: StepStatus; note: string };

type FrozenPlan = {
  move: { payload: ChangeClassPayload; key: string };
  reply: { on: boolean; text: string; draftKey: string; approveKey: string; revision: number | null };
  task: { on: boolean; payload: CreateTaskPayload; key: string };
};

const STEP_ORDER: StepKey[] = ["move", "reply", "task"];

const WAITING: Record<StepKey, StepState> = {
  move: { status: "waiting", note: "" },
  reply: { status: "waiting", note: "" },
  task: { status: "waiting", note: "" },
};

const secondaryButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted) disabled:opacity-50";
const primaryButton =
  "inline-flex h-8 items-center rounded-lg bg-(--crm-brand) px-3 text-[12px] font-bold text-white disabled:opacity-50";

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />;
  if (status === "done") return <Check className="h-3.5 w-3.5 text-[color:var(--color-success)]" aria-hidden="true" />;
  if (status === "failed") return <X className="h-3.5 w-3.5 text-[color:var(--color-alert)]" aria-hidden="true" />;
  if (status === "uncertain") return <CircleAlert className="h-3.5 w-3.5 text-[color:var(--color-warning)]" aria-hidden="true" />;
  return <CircleDashed className="h-3.5 w-3.5 muted" aria-hidden="true" />;
}

export default function ClassMovePlan({
  context,
  message,
  onClose,
  onChanged,
}: {
  context: HubContext;
  message: HubMessage;
  onClose: () => void;
  onChanged: () => Promise<void>; // read the inbox again
}) {
  const student = memberName(context, message.memberId) ?? "the student";
  const fromSession = sessionOf(context, message.sessionId);
  const channel = CHANNEL_LABELS[message.channel] ?? message.channel;
  const targets = context.sessions
    .filter((session) => session.future && session.id !== message.sessionId)
    .sort((a, b) => Date.parse(a.startsAt ?? "") - Date.parse(b.startsAt ?? ""));
  const outboundReady = context.capabilities.outbound !== "not_configured";
  const canAddTask = context.principal.role === "owner" || context.principal.role === "manager";
  // change_class only moves a booking from a class that hasn't started yet
  const fromMovable = fromSession !== null && fromSession.future;

  const [targetId, setTargetId] = useState("");
  const [replyOn, setReplyOn] = useState(outboundReady);
  const [replyEdited, setReplyEdited] = useState<string | null>(null); // null: use the prepared text
  const [taskOn, setTaskOn] = useState(canAddTask);
  const [taskEdited, setTaskEdited] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [steps, setSteps] = useState<Record<StepKey, StepState>>(WAITING);
  const frozen = useRef<FrozenPlan | null>(null);
  const [started, setStarted] = useState(false); // applied at least once: choices are locked

  const target = targets.find((session) => session.id === targetId) ?? null;
  const replyText = replyEdited ?? (target ? moveReplyText(student, target.title, target.startsAt) : "");
  const taskText = taskEdited ?? (target ? moveTaskSummary(student, target.title, target.startsAt) : "");
  const finished = STEP_ORDER.every((key) => steps[key].status === "done" || steps[key].status === "skipped");
  const stopped = STEP_ORDER.some((key) => steps[key].status === "failed");
  const unconfirmed = STEP_ORDER.some((key) => steps[key].status === "uncertain");
  const ready = fromMovable && target !== null && message.memberId !== null && message.sessionId !== null
    && (!replyOn || replyText.trim().length > 0) && (!taskOn || taskText.trim().length > 0);

  function setStep(key: StepKey, status: StepStatus, note = "") {
    setSteps((current) => ({ ...current, [key]: { status, note } }));
  }

  function freeze(): FrozenPlan | null {
    if (frozen.current) return frozen.current;
    if (!target || !message.memberId || !message.sessionId) return null;
    frozen.current = {
      move: {
        payload: { memberId: message.memberId, sessionId: target.id, fromSessionId: message.sessionId, expectedVersion: target.version },
        key: newRequestKey(),
      },
      reply: {
        on: replyOn,
        text: replyText.trim(),
        draftKey: newRequestKey(),
        approveKey: newRequestKey(),
        // approve_reply needs a Hub draft on the message; draft first if there isn't one
        revision: message.reply ? message.revision : null,
      },
      task: {
        on: taskOn,
        payload: { relatedType: "member", relatedId: message.memberId, summary: taskText.trim(), due: classDay(target.startsAt) },
        key: newRequestKey(),
      },
    };
    return frozen.current;
  }

  // Answers from a step: true to go on to the next step
  function settle(key: StepKey, answer: { outcome: string; code?: string }, doneNote: string): boolean {
    if (answer.outcome === "done") {
      setStep(key, "done", doneNote);
      return true;
    }
    if (answer.outcome === "notConfirmed") {
      setStep(key, "uncertain", "Odoo hasn't confirmed this step. Retry it; it won't be done twice.");
      return false;
    }
    setStep(key, "failed", `${explainHubError(answer.code ?? "")} Nothing was saved for this step.`);
    return false;
  }

  async function runStep(key: StepKey, plan: FrozenPlan): Promise<boolean> {
    if (key === "move") {
      setStep("move", "running");
      const answer = await changeClass(plan.move.payload, plan.move.key);
      return settle("move", answer, `${student} is booked into ${target?.title ?? "the new class"}.`);
    }
    if (key === "reply") {
      if (!plan.reply.on) {
        setStep("reply", "skipped", "Not sent (turned off).");
        return true;
      }
      setStep("reply", "running");
      if (plan.reply.revision === null) {
        const drafted = await runInboxAction("draft", { messageId: message.id, expectedRevision: message.revision }, plan.reply.draftKey);
        if (drafted.outcome !== "done") return settle("reply", drafted, "");
        plan.reply.revision = drafted.result.revision;
      }
      const approved = await runInboxAction(
        "approve_reply",
        { messageId: message.id, expectedRevision: plan.reply.revision, reply: plan.reply.text },
        plan.reply.approveKey,
      );
      return settle("reply", approved, `Reply queued for ${senderName(message)} on ${channel}.`);
    }
    if (!plan.task.on) {
      setStep("task", "skipped", "Not added (turned off).");
      return true;
    }
    setStep("task", "running");
    const answer = await createTask(plan.task.payload, plan.task.key);
    return settle("task", answer, `Follow-up task due ${plan.task.payload.due}.`);
  }

  // Runs the remaining steps in order; also how an unconfirmed step is retried
  async function apply() {
    const plan = freeze();
    if (!plan || applying) return;
    setStarted(true);
    setApplying(true);
    for (const key of STEP_ORDER) {
      if (steps[key].status === "done" || steps[key].status === "skipped") continue;
      const goOn = await runStep(key, plan);
      if (!goOn) break;
    }
    setApplying(false);
    await onChanged();
  }

  return (
    <section aria-label="Move to another class" className="roster-scope">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold leading-snug">Move {student} to another class</h3>
          <p className="text-[11px] muted">Prepared from your choices, not by AI. Nothing changes until you apply.</p>
        </div>
        {!applying && (
          <button type="button" onClick={onClose} className="rounded-md p-1 muted hover:text-[color:var(--color-fg)]" aria-label="Close class move">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {!fromMovable ? (
        <p className="text-xs muted">
          {fromSession
            ? `${fromSession.title} has already started, so the booking can't be moved from it.`
            : "The class this message is about is no longer listed, so there's no booking to move."}
        </p>
      ) : (
        <div className="space-y-3 text-xs">
          {/* 1. The move */}
          <div>
            <p className="mb-1 font-medium">1. Move the booking</p>
            <div className="space-y-1.5">
              <p className="muted">From {fromSession.title} · {classWhen(fromSession.startsAt)}</p>
              <ArrowDown className="h-3.5 w-3.5 muted" aria-hidden="true" />
              <Select
                aria-label="New class"
                value={targetId}
                disabled={started}
                onChange={(event) => setTargetId(event.target.value)}
                className="h-8 text-xs"
              >
                <option value="">Choose the new class</option>
                {targets.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title} · {classWhen(session.startsAt)}
                  </option>
                ))}
              </Select>
            </div>
            {targets.length === 0 && <p className="mt-1 muted">There are no other upcoming classes to move to.</p>}
          </div>

          {/* 2. The reply */}
          <div>
            <label className="mb-1 flex items-center gap-2 font-medium">
              <input type="checkbox" checked={replyOn} disabled={started || !outboundReady} onChange={(event) => setReplyOn(event.target.checked)} />
              2. Reply to {senderName(message)} on {channel}
            </label>
            {!outboundReady ? (
              <p className="muted">Outbound messaging isn&apos;t set up for this school, so no reply can be sent.</p>
            ) : (
              replyOn && (
                <Textarea
                  aria-label="Reply text"
                  value={replyText}
                  disabled={started || !target}
                  maxLength={1500}
                  placeholder="Choose the new class first"
                  onChange={(event) => setReplyEdited(event.target.value)}
                  className="min-h-[88px] text-xs"
                />
              )
            )}
          </div>

          {/* 3. The follow-up task */}
          <div>
            <label className="mb-1 flex items-center gap-2 font-medium">
              <input type="checkbox" checked={taskOn} disabled={started || !canAddTask} onChange={(event) => setTaskOn(event.target.checked)} />
              3. Add a follow-up task{target ? `, due ${classDay(target.startsAt)}` : ""}
            </label>
            {!canAddTask ? (
              <p className="muted">Only owners and managers can add tasks.</p>
            ) : (
              taskOn && (
                <Input
                  aria-label="Task summary"
                  value={taskText}
                  disabled={started || !target}
                  maxLength={200}
                  placeholder="Choose the new class first"
                  onChange={(event) => setTaskEdited(event.target.value)}
                  className="h-8 text-xs"
                />
              )
            )}
          </div>

          {/* Progress, once applied */}
          {started && (
            <ul role="status" aria-live="polite" className="space-y-1 border-t border-[color:var(--color-border)] pt-2">
              {STEP_ORDER.map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="mt-0.5"><StepIcon status={steps[key].status} /></span>
                  <span>
                    {key === "move" ? "Move the booking" : key === "reply" ? "Reply to the guardian" : "Follow-up task"}
                    {steps[key].note && <span className="block muted">{steps[key].note}</span>}
                    {steps[key].status === "waiting" && (stopped || unconfirmed) && <span className="block muted">Not run.</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {!started && (
              <Button variant="primary" size="sm" disabled={!ready} onClick={() => setReviewing(true)}>
                Review
              </Button>
            )}
            {unconfirmed && !applying && (
              <Button size="sm" onClick={() => void apply()}>
                Retry the unconfirmed step
              </Button>
            )}
            {(finished || stopped) && !applying && (
              <Button size="sm" onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Review -> Apply */}
      <Modal
        open={reviewing}
        onClose={() => setReviewing(false)}
        title="Apply this class move?"
        boxClassName="glass crm-scope"
        titleClassName="text-base"
        footer={
          <>
            <button type="button" onClick={() => setReviewing(false)} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setReviewing(false);
                void apply();
              }}
              className={primaryButton}
            >
              Apply
            </button>
          </>
        }
      >
        <ol className="list-decimal space-y-2 ps-5 text-[13px] leading-relaxed text-(--crm-text-secondary)">
          <li>
            Move {student} from {fromSession?.title} ({classWhen(fromSession?.startsAt ?? null)}) to{" "}
            <strong className="text-(--crm-text)">{target?.title} ({classWhen(target?.startsAt ?? null)})</strong>.
          </li>
          <li>
            {replyOn ? (
              <>
                Send {senderName(message)} on {channel}: <em className="text-(--crm-text)">&ldquo;{replyText.trim()}&rdquo;</em>
              </>
            ) : (
              "No reply."
            )}
          </li>
          <li>{taskOn ? `Add the task "${taskText.trim()}", due ${target ? classDay(target.startsAt) : ""}.` : "No task."}</li>
        </ol>
        <p className="mt-3 text-[12px] text-(--crm-muted)">
          Steps run in order through Odoo. If one fails, the rest don&apos;t run and you&apos;ll see what was done.
        </p>
      </Modal>
    </section>
  );
}
