// Do For Me's class move for an Inbox message: move the student to another
// class, reply to the guardian, and add a follow-up task, as one reviewed plan.
// Every step is an existing Hub operation (Jodi's dojo_companion_hub):
//   change_class   service.py _change_class: cancels the booking in the old class
//                  and books the new one in one transaction. expectedVersion is
//                  the NEW class's version. The old class must not have started
//                  and the student must not be checked in to it.
//   approve_reply  the Inbox reply (needs a Hub draft on the message first)
//   create_task    crm.py _create_task: an internal task on the member (owners
//                  and managers only). Due date as YYYY-MM-DD.
// The plan is prepared from staff's choices and fixed text, not by AI.

export type ChangeClassPayload = { memberId: string; sessionId: string; fromSessionId: string; expectedVersion: number };
export type ChangeClassResult = { memberId: string; sessionId: string; enrollmentId: string; state: "registered"; replayed: boolean };

export type CreateTaskPayload = { relatedType: "lead" | "member"; relatedId: string; summary: string; due: string };
export type CreateTaskResult = { taskId: string; leadId?: string; memberId?: string; replayed: boolean };

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isRecordId = (value: unknown): value is string => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
const isVersion = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isDay = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export function isChangeClassPayload(value: unknown): value is ChangeClassPayload {
  return isObject(value) && Object.keys(value).sort().join() === "expectedVersion,fromSessionId,memberId,sessionId"
    && isRecordId(value.memberId) && isRecordId(value.sessionId) && isRecordId(value.fromSessionId)
    && value.sessionId !== value.fromSessionId && isVersion(value.expectedVersion);
}
export function isChangedClassResult(value: unknown, payload: ChangeClassPayload): value is ChangeClassResult {
  return isObject(value) && value.memberId === payload.memberId && value.sessionId === payload.sessionId
    && isRecordId(value.enrollmentId) && value.state === "registered" && typeof value.replayed === "boolean";
}

export function isCreateTaskPayload(value: unknown): value is CreateTaskPayload {
  return isObject(value) && Object.keys(value).sort().join() === "due,relatedId,relatedType,summary"
    && (value.relatedType === "lead" || value.relatedType === "member") && isRecordId(value.relatedId)
    && typeof value.summary === "string" && value.summary.trim().length >= 1 && value.summary.length <= 200
    && isDay(value.due);
}
export function isCreatedTaskResult(value: unknown, payload: CreateTaskPayload): value is CreateTaskResult {
  if (!isObject(value) || !isRecordId(value.taskId) || typeof value.replayed !== "boolean") return false;
  return payload.relatedType === "lead" ? value.leadId === payload.relatedId : value.memberId === payload.relatedId;
}

// "Tue, Nov 3, 4:30 PM" in the viewer's time zone
export function classWhen(iso: string | null) {
  if (!iso) return "time not set";
  return new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// The class's day in the viewer's time zone, as YYYY-MM-DD (the task's due date)
export function classDay(iso: string | null) {
  const date = iso ? new Date(iso) : new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// The starting text for the reply and the task. Staff can edit both.
export function moveReplyText(studentName: string, classTitle: string, startsAt: string | null) {
  return `Hi! ${studentName} is now booked into ${classTitle} on ${classWhen(startsAt)}. See you then!`;
}
export function moveTaskSummary(studentName: string, classTitle: string, startsAt: string | null) {
  return `Confirm ${studentName} attends ${classTitle} (${classWhen(startsAt)}) after a class move`;
}
