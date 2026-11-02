"use client";

import { useEffect, useId, useRef, useState } from "react";
import { explainHubError, newRequestKey } from "@/domain/hubAction";
import type { AddLeadNotePayload, AddLeadNoteResult, CompleteTaskPayload, CompleteTaskResult, TaskSubject } from "@/domain/crmWrites";
import { addLeadNote, completeTask } from "@/integrations/crmWrites";
import { useStaffSessionReset } from "@/views/shell/staffSession";
import { useMarkSignedOut } from "@/views/shell/staffConnection";

type Command = { kind: "task"; payload: CompleteTaskPayload; subject: TaskSubject } | { kind: "note"; payload: AddLeadNotePayload };
type Result = CompleteTaskResult | AddLeadNoteResult;
type Status = "editing" | "pending" | "uncertain" | "failed" | "conflict" | "done";
const button = "rounded-lg border border-(--crm-line) px-3 py-2 text-[12px] font-bold disabled:opacity-50";

// Only these two approved internal operations. An uncertain attempt retains
// its exact payload and request key; editing cannot turn a retry into a new write.
export default function CrmWriteForm({ kind, title, description, unavailable, build, onDone, onReload, onClose }: {
  kind: "task" | "note"; title: string; description: string; unavailable?: string;
  build: (text: string) => Command; onDone: (result: Result) => void;
  onReload: () => void; onClose?: () => void;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("editing");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Result | null>(null);
  const frozen = useRef<{ key: string; command: Command } | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const resetSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const maximum = kind === "task" ? 1000 : 2000;
  const locked = status === "pending" || status === "uncertain";

  async function submit() {
    if (inFlight.current || (unavailable && !frozen.current) || status === "done") return;
    if (!frozen.current && (!text.trim() || text.length > maximum)) return;
    frozen.current ??= { key: newRequestKey(), command: build(text.trim()) };
    const { key, command } = frozen.current;
    inFlight.current = true;
    setStatus("pending");
    setError("");
    const answer = command.kind === "task"
      ? await completeTask(command.payload, command.subject, key)
      : await addLeadNote(command.payload, key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === "notConfirmed") { setStatus("uncertain"); return; }
    frozen.current = null;
    if (answer.outcome === "failed") {
      if (answer.code === "SIGN_IN_REQUIRED" || answer.code === "UNAUTHENTICATED") {
        resetSession(); markSignedOut(); onReload();
      }
      setError(answer.code);
      setStatus(answer.code === "VERSION_CONFLICT" ? "conflict" : "failed");
      return;
    }
    setReceipt(answer.result);
    setStatus("done");
    setText("");
    onDone(answer.result);
  }

  return <section className="mb-4 rounded-xl border border-(--crm-line) bg-(--crm-panel) p-4 text-(--crm-text)" aria-label={title}>
    <h3 className="text-sm font-bold">{title}</h3>
    <p className="my-2 text-[12px] text-(--crm-text-secondary)">{description}</p>
    {unavailable && status !== "done" && !locked ? <p className="text-[12px] text-(--crm-muted)">{unavailable}</p> : status === "done" && receipt ? <div role="status" className="space-y-3 text-[12px]">
      <p>{"noteId" in receipt ? `Internal note #${receipt.noteId} saved.` : `Task #${receipt.taskId} completion confirmed.`} {receipt.replayed && "Recovered the original result; no duplicate write."} No outbound message was sent.</p>
      <p>The CRM read is refreshing. Saved notes and task state below come from Odoo.</p>
      <button type="button" className={button} onClick={onReload}>Refresh records again</button>
      {kind === "note" && <button type="button" className={`${button} ml-2`} onClick={() => { setStatus("editing"); setReceipt(null); }}>Write another note</button>}
    </div> : <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <label htmlFor={id} className="block text-[12px] font-semibold">{kind === "task" ? "Outcome / completion feedback" : "Internal note"}</label>
      <textarea id={id} required maxLength={maximum} value={text} disabled={locked} onChange={(event) => setText(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-(--crm-line) bg-(--crm-canvas) p-3 text-sm disabled:opacity-60" />
      <p className="mb-3 text-[11px] text-(--crm-muted)">{text.length}/{maximum} · Internal record only; no SMS, WhatsApp or email.</p>
      {status === "uncertain" && <p role="alert" className="mb-3 text-[12px]">The result is unknown. It may already be saved. Retry the original request to recover its result using the same request key; do not start a replacement.</p>}
      {status === "conflict" && <p role="alert" className="mb-3 text-[12px]">This record changed. Refresh records, review the updated state, then submit again. Your text is retained.</p>}
      {status === "failed" && <p role="alert" className="mb-3 text-[12px]">{explainHubError(error)}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={status === "pending" || (!locked && !text.trim())} className={`${button} bg-(--crm-brand) text-white`}>{status === "pending" ? "Waiting for Hub confirmation…" : status === "uncertain" ? "Retry original request" : kind === "task" ? "Confirm task completion" : "Save internal note"}</button>
        {(status === "conflict" || status === "failed" || status === "uncertain") && <button type="button" onClick={onReload} className={button}>Refresh records</button>}
        {onClose && <button type="button" disabled={locked} onClick={onClose} className={button}>Cancel</button>}
      </div>
    </form>}
    {onClose && (status === "done" || unavailable) && <button type="button" disabled={locked} className={`${button} mt-3`} onClick={onClose}>Close</button>}
  </section>;
}
