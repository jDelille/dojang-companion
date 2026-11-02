export type CompleteTaskPayload = { taskId: string; expectedVersion: number; feedback: string };
export type AddLeadNotePayload = { leadId: string; expectedVersion: number; note: string };
export type CompleteTaskResult = { taskId: string; leadId?: string; memberId?: string; state: "done"; replayed: boolean };
export type AddLeadNoteResult = { leadId: string; noteId: string; state: "saved"; messageSent: false; replayed: boolean };
export type TaskSubject = { kind: "lead" | "member"; id: string };
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const id = (value: unknown) => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
const version = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const text = (value: unknown, max: number) => typeof value === "string" && value.trim().length >= 1 && value.length <= max;

export function isCompleteTaskPayload(value: unknown): value is CompleteTaskPayload {
  return object(value) && Object.keys(value).sort().join() === "expectedVersion,feedback,taskId"
    && id(value.taskId) && version(value.expectedVersion) && text(value.feedback, 1000);
}
export function isAddLeadNotePayload(value: unknown): value is AddLeadNotePayload {
  return object(value) && Object.keys(value).sort().join() === "expectedVersion,leadId,note"
    && id(value.leadId) && version(value.expectedVersion) && text(value.note, 2000);
}
export function isCompletedTaskResult(value: unknown, taskId: string, subject: TaskSubject): value is CompleteTaskResult {
  return object(value) && value.taskId === taskId && value.state === "done" && typeof value.replayed === "boolean"
    && (subject.kind === "lead" ? value.leadId === subject.id && value.memberId === undefined : value.memberId === subject.id && value.leadId === undefined);
}
export function isSavedLeadNoteResult(value: unknown, leadId: string): value is AddLeadNoteResult {
  return object(value) && value.leadId === leadId && id(value.noteId) && value.state === "saved"
    && value.messageSent === false && typeof value.replayed === "boolean";
}
