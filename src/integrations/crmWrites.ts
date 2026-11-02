import type { HubAnswer } from "./hub";
import { isRequestKey } from "@/domain/hubAction";
import {
  isAddLeadNotePayload, isCompleteTaskPayload, isCompletedTaskResult, isSavedLeadNoteResult,
  type AddLeadNotePayload, type AddLeadNoteResult, type CompleteTaskPayload, type CompleteTaskResult, type TaskSubject,
} from "@/domain/crmWrites";

const UNCERTAIN = ["CONCURRENT_RETRY", "BACKEND_UNAVAILABLE", "BACKEND_UNAVAILABLE_RETRY_SAME_ACTION"];

async function write<T>(operation: "complete_task" | "add_lead_note", payload: CompleteTaskPayload | AddLeadNotePayload, requestKey: string, accepts: (value: unknown) => value is T): Promise<HubAnswer<T>> {
  if (!isRequestKey(requestKey)) return { outcome: "failed", code: "INVALID_COMMAND" };
  try {
    const response = await fetch("/api/hub", {
      method: "POST", cache: "no-store", headers: { "content-type": "application/json" },
      body: JSON.stringify({ operation, payload, requestKey }), signal: AbortSignal.timeout(45000),
    });
    const result: unknown = await response.json();
    if (response.ok) return accepts(result) ? { outcome: "done", result } : { outcome: "notConfirmed" };
    const error = result && typeof result === "object" && "error" in result ? result.error : null;
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : null;
    return code && !UNCERTAIN.includes(code) ? { outcome: "failed", code } : { outcome: "notConfirmed" };
  } catch {
    return { outcome: "notConfirmed" };
  }
}

export function completeTask(payload: CompleteTaskPayload, subject: TaskSubject, requestKey: string): Promise<HubAnswer<CompleteTaskResult>> {
  if (!isCompleteTaskPayload(payload)) return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
  return write("complete_task", payload, requestKey, (value): value is CompleteTaskResult => isCompletedTaskResult(value, payload.taskId, subject));
}
export function addLeadNote(payload: AddLeadNotePayload, requestKey: string): Promise<HubAnswer<AddLeadNoteResult>> {
  if (!isAddLeadNotePayload(payload)) return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
  return write("add_lead_note", payload, requestKey, (value): value is AddLeadNoteResult => isSavedLeadNoteResult(value, payload.leadId));
}
