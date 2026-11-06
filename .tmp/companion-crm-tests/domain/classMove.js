"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChangeClassPayload = isChangeClassPayload;
exports.isChangedClassResult = isChangedClassResult;
exports.isCreateTaskPayload = isCreateTaskPayload;
exports.isCreatedTaskResult = isCreatedTaskResult;
exports.classWhen = classWhen;
exports.classDay = classDay;
exports.moveReplyText = moveReplyText;
exports.moveTaskSummary = moveTaskSummary;
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const isRecordId = (value) => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
const isVersion = (value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isDay = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
function isChangeClassPayload(value) {
    return isObject(value) && Object.keys(value).sort().join() === "expectedVersion,fromSessionId,memberId,sessionId"
        && isRecordId(value.memberId) && isRecordId(value.sessionId) && isRecordId(value.fromSessionId)
        && value.sessionId !== value.fromSessionId && isVersion(value.expectedVersion);
}
function isChangedClassResult(value, payload) {
    return isObject(value) && value.memberId === payload.memberId && value.sessionId === payload.sessionId
        && isRecordId(value.enrollmentId) && value.state === "registered" && typeof value.replayed === "boolean";
}
function isCreateTaskPayload(value) {
    return isObject(value) && Object.keys(value).sort().join() === "due,relatedId,relatedType,summary"
        && (value.relatedType === "lead" || value.relatedType === "member") && isRecordId(value.relatedId)
        && typeof value.summary === "string" && value.summary.trim().length >= 1 && value.summary.length <= 200
        && isDay(value.due);
}
function isCreatedTaskResult(value, payload) {
    if (!isObject(value) || !isRecordId(value.taskId) || typeof value.replayed !== "boolean")
        return false;
    return payload.relatedType === "lead" ? value.leadId === payload.relatedId : value.memberId === payload.relatedId;
}
// "Tue, Nov 3, 4:30 PM" in the viewer's time zone
function classWhen(iso) {
    if (!iso)
        return "time not set";
    return new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
// The class's day in the viewer's time zone, as YYYY-MM-DD (the task's due date)
function classDay(iso) {
    const date = iso ? new Date(iso) : new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}
// The starting text for the reply and the task. Staff can edit both.
function moveReplyText(studentName, classTitle, startsAt) {
    return `Hi! ${studentName} is now booked into ${classTitle} on ${classWhen(startsAt)}. See you then!`;
}
function moveTaskSummary(studentName, classTitle, startsAt) {
    return `Confirm ${studentName} attends ${classTitle} (${classWhen(startsAt)}) after a class move`;
}
