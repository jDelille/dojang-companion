"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTask = completeTask;
exports.addLeadNote = addLeadNote;
exports.createLead = createLead;
exports.updateLead = updateLead;
exports.assignLead = assignLead;
exports.reserveTrial = reserveTrial;
exports.proposeStage = proposeStage;
exports.recordTrialAttendance = recordTrialAttendance;
exports.createStudent = createStudent;
exports.changeClass = changeClass;
exports.createTask = createTask;
const postTrial_1 = require("@/domain/postTrial");
const trial_1 = require("@/domain/trial");
const studentIntake_1 = require("@/domain/studentIntake");
const hubAction_1 = require("@/domain/hubAction");
const trial_2 = require("@/domain/trial");
const crmWrites_1 = require("@/domain/crmWrites");
const classMove_1 = require("@/domain/classMove");
const UNCERTAIN = ["CONCURRENT_RETRY", "BACKEND_UNAVAILABLE", "BACKEND_UNAVAILABLE_RETRY_SAME_ACTION"];
async function write(operation, payload, requestKey, accepts) {
    if (!(0, hubAction_1.isRequestKey)(requestKey))
        return { outcome: "failed", code: "INVALID_COMMAND" };
    try {
        const response = await fetch("/api/hub", {
            method: "POST", cache: "no-store", headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation, payload, requestKey }), signal: AbortSignal.timeout(45000),
        });
        const result = await response.json();
        if (response.ok)
            return accepts(result) ? { outcome: "done", result } : { outcome: "notConfirmed" };
        const error = result && typeof result === "object" && "error" in result ? result.error : null;
        const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : null;
        if (code === 'FORBIDDEN') {
            const stage = response.headers.get('x-dojang-hub-error-stage');
            if (stage === 'origin')
                return { outcome: 'failed', code: 'REQUEST_ORIGIN_REJECTED' };
            if (stage === 'backend' && operation === 'assign_lead')
                return { outcome: 'failed', code: 'ODOO_ASSIGNMENT_FORBIDDEN' };
        }
        return code && !UNCERTAIN.includes(code) ? { outcome: "failed", code } : { outcome: "notConfirmed" };
    }
    catch {
        return { outcome: "notConfirmed" };
    }
}
function completeTask(payload, subject, requestKey) {
    if (!(0, crmWrites_1.isCompleteTaskPayload)(payload))
        return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
    return write("complete_task", payload, requestKey, (value) => (0, crmWrites_1.isCompletedTaskResult)(value, payload.taskId, subject));
}
function addLeadNote(payload, requestKey) {
    if (!(0, crmWrites_1.isAddLeadNotePayload)(payload))
        return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
    return write("add_lead_note", payload, requestKey, (value) => (0, crmWrites_1.isSavedLeadNoteResult)(value, payload.leadId));
}
function createLead(payload, requestKey) {
    if (!(0, crmWrites_1.isCreateLeadPayload)(payload))
        return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
    return write("create_lead", payload, requestKey, crmWrites_1.isCreatedLeadResult);
}
function updateLead(payload, requestKey) {
    if (!(0, crmWrites_1.isUpdateLeadPayload)(payload))
        return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
    return write('update_lead', payload, requestKey, (value) => (0, crmWrites_1.isUpdatedLeadResult)(value, payload));
}
function assignLead(payload, requestKey) {
    if (!(0, crmWrites_1.isAssignLeadPayload)(payload))
        return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
    return write('assign_lead', payload, requestKey, (value) => (0, crmWrites_1.isAssignedLeadResult)(value, payload));
}
function reserveTrial(payload, requestKey) {
    if (!(0, trial_2.isReserveTrialPayload)(payload))
        return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
    return write('reserve_trial', payload, requestKey, (value) => (0, trial_2.isReservedTrialResult)(value, payload));
}
function proposeStage(payload, requestKey) {
    if (!(0, postTrial_1.isStageProposalPayload)(payload))
        return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
    return write('propose_stage', payload, requestKey, (value) => (0, postTrial_1.isStageProposalResult)(value, payload));
}
function recordTrialAttendance(payload, leadId, trial, requestKey) {
    if (!(0, trial_1.isTrialAttendancePayload)(payload) || trial.id !== payload.trialId)
        return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
    return write('record_trial_outcome', payload, requestKey, (value) => (0, trial_1.isTrialAttendanceResult)(value, payload, leadId, trial));
}
function createStudent(payload, requestKey) {
    if (!(0, studentIntake_1.isCreateStudentPayload)(payload))
        return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
    return write('create_student', payload, requestKey, (value) => (0, studentIntake_1.isStudentReceipt)(value, payload));
}
// Do For Me's class move (src/domain/classMove.ts)
function changeClass(payload, requestKey) {
    if (!(0, classMove_1.isChangeClassPayload)(payload))
        return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
    return write("change_class", payload, requestKey, (value) => (0, classMove_1.isChangedClassResult)(value, payload));
}
function createTask(payload, requestKey) {
    if (!(0, classMove_1.isCreateTaskPayload)(payload))
        return Promise.resolve({ outcome: "failed", code: "INVALID_COMMAND" });
    return write("create_task", payload, requestKey, (value) => (0, classMove_1.isCreatedTaskResult)(value, payload));
}
