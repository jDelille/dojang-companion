"use client";

import type { TaskSubject } from "@/domain/crmWrites";
import { useEffect, useRef } from "react";
import CrmWriteForm from "./crmWriteForm";

export default function TaskCompletion({ task, subject, enabled, onDone, onReload, onClose, onAuthenticationLost }: {
  task: { id: string; summary: string; version?: number; canComplete?: boolean };
  onAuthenticationLost?: () => void;
  subject: TaskSubject; enabled: boolean; onDone: () => void; onReload: () => void; onClose: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    container.current?.focus({ preventScroll: true });
    container.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);
  const unavailable = !enabled ? "Task completion is unavailable in fixture mode. No Odoo record will be changed."
    : task.canComplete !== true ? "Odoo does not allow manual completion of this task."
    : task.version === undefined ? "This read does not provide a task version. Refresh or review the task in Odoo." : undefined;
  return <div ref={container} tabIndex={-1}><CrmWriteForm kind="task" title="Complete internal task" description={`${task.summary}. Records your outcome and marks this task done; it does not prepare the next follow-up.`}
    unavailable={unavailable} build={(feedback) => ({ kind: "task", subject, payload: { taskId: task.id, expectedVersion: task.version!, feedback } })}
    onAuthenticationLost={onAuthenticationLost} onDone={onDone} onReload={onReload} onClose={onClose} /></div>;
}
