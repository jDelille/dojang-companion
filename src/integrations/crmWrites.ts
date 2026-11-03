import type { HubAnswer } from "./hub";
import { isRequestKey } from "@/domain/hubAction";
import {
  isAddLeadNotePayload, isCompleteTaskPayload, isCompletedTaskResult, isCreateLeadPayload, isCreatedLeadResult, isSavedLeadNoteResult,
  type AddLeadNotePayload, type AddLeadNoteResult, type CompleteTaskPayload, type CompleteTaskResult, type CreateLeadPayload, type CreateLeadResult, type TaskSubject,
} from "@/domain/crmWrites";
import {
  isChangeClassPayload, isChangedClassResult, isCreateTaskPayload, isCreatedTaskResult,
  type ChangeClassPayload, type ChangeClassResult, type CreateTaskPayload, type CreateTaskResult,
} from "@/domain/classMove";

const UNCERTAIN = ["CONCURRENT_RETRY", "BACKEND_UNAVAILABLE", "BACKEND_UNAVAILABLE_RETRY_SAME_ACTION"];

type WriteOperation = "complete_task" | "add_lead_note" | "create_lead" | "change_class" | "create_task";
type WritePayload = CompleteTaskPayload | AddLeadNotePayload | CreateLeadPayload | ChangeClassPayload | CreateTaskPayload;

async function write<T>(operation: WriteOperation, payload: WritePayload, requestKey: string, accepts: (value: unknown) => value is T): Promise<HubAnswer<T>> {
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
export function createLead(payload: CreateLeadPayload, requestKey: string): Promise<HubAnswer<CreateLeadResult>> {
  if (!isCreateLeadPayload(payload)) return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
  return write("create_lead", payload, requestKey, isCreatedLeadResult);
}
// Do For Me's class move (src/domain/classMove.ts)
export function changeClass(payload: ChangeClassPayload, requestKey: string): Promise<HubAnswer<ChangeClassResult>> {
  if (!isChangeClassPayload(payload)) return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
  return write("change_class", payload, requestKey, (value): value is ChangeClassResult => isChangedClassResult(value, payload));
}
export function createTask(payload: CreateTaskPayload, requestKey: string): Promise<HubAnswer<CreateTaskResult>> {
  if (!isCreateTaskPayload(payload)) return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
  return write("create_task", payload, requestKey, (value): value is CreateTaskResult => isCreatedTaskResult(value, payload));
}
