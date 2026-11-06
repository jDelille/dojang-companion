"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompleteTaskPayload = isCompleteTaskPayload;
exports.isAddLeadNotePayload = isAddLeadNotePayload;
exports.isCompletedTaskResult = isCompletedTaskResult;
exports.isSavedLeadNoteResult = isSavedLeadNoteResult;
exports.isCreateLeadPayload = isCreateLeadPayload;
exports.isCreatedLeadResult = isCreatedLeadResult;
exports.isAssignLeadPayload = isAssignLeadPayload;
exports.isAssignedLeadResult = isAssignedLeadResult;
exports.isUpdateLeadPayload = isUpdateLeadPayload;
exports.isUpdatedLeadResult = isUpdatedLeadResult;
exports.changedLeadFields = changedLeadFields;
const object = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const id = (value) => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
const version = (value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const text = (value, max) => typeof value === "string" && value.trim().length >= 1 && value.length <= max;
function isCompleteTaskPayload(value) {
    return object(value) && Object.keys(value).sort().join() === "expectedVersion,feedback,taskId"
        && id(value.taskId) && version(value.expectedVersion) && text(value.feedback, 1000);
}
function isAddLeadNotePayload(value) {
    return object(value) && Object.keys(value).sort().join() === "expectedVersion,leadId,note"
        && id(value.leadId) && version(value.expectedVersion) && text(value.note, 2000);
}
function isCompletedTaskResult(value, taskId, subject) {
    return object(value) && value.taskId === taskId && value.state === "done" && typeof value.replayed === "boolean"
        && (subject.kind === "lead" ? value.leadId === subject.id && value.memberId === undefined : value.memberId === subject.id && value.leadId === undefined);
}
function isSavedLeadNoteResult(value, leadId) {
    return object(value) && value.leadId === leadId && id(value.noteId) && value.state === "saved"
        && value.messageSent === false && typeof value.replayed === "boolean";
}
const field = (value) => typeof value === "string" && value.length <= 200;
function isCreateLeadPayload(value) {
    return object(value) && Object.keys(value).sort().join() === "contact,email,name,phone"
        && field(value.name) && text(value.name, 200) && field(value.contact) && field(value.phone)
        && field(value.email) && (value.email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value.email).trim()));
}
function isCreatedLeadResult(value) {
    return object(value) && id(value.leadId) && version(value.version) && typeof value.replayed === "boolean";
}
function isAssignLeadPayload(value) {
    return object(value) && Object.keys(value).sort().join() === 'expectedVersion,leadId,ownerId'
        && id(value.leadId) && version(value.expectedVersion) && id(value.ownerId);
}
function isAssignedLeadResult(value, payload) {
    return object(value) && value.leadId === payload.leadId && value.ownerId === payload.ownerId
        && value.state === 'assigned' && typeof value.replayed === 'boolean';
}
function isUpdateLeadPayload(value) {
    if (!object(value) || Object.keys(value).sort().join() !== 'changes,expectedVersion,leadId'
        || !id(value.leadId) || !version(value.expectedVersion) || !object(value.changes))
        return false;
    const entries = Object.entries(value.changes);
    return entries.length > 0 && entries.every(([key, v]) => ['name', 'contact', 'email', 'phone'].includes(key)
        && field(v) && (key !== 'name' || text(v, 200))
        && (key !== 'email' || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())));
}
function isUpdatedLeadResult(value, payload) {
    return isCreatedLeadResult(value) && value.leadId === payload.leadId && value.version >= payload.expectedVersion;
}
function changedLeadFields(original, draft) {
    const changes = {};
    for (const key of ['name', 'contact', 'email', 'phone']) {
        if (draft[key] === original[key])
            continue;
        const value = draft[key].trim();
        if (value !== original[key])
            changes[key] = value;
    }
    return changes;
}
