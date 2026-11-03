import type { HubAnswer } from "./hub";
import { isStageProposalPayload, isStageProposalResult, type StageProposalPayload, type StageProposalResult } from '@/domain/postTrial';
import { isTrialAttendancePayload, isTrialAttendanceResult, type TrialAttendancePayload, type TrialAttendanceResult, type TrialRecord } from '@/domain/trial';
import { isCreateStudentPayload, isStudentReceipt, type CreateStudentPayload, type StudentReceipt } from '@/domain/studentIntake';
import { isRequestKey } from "@/domain/hubAction";
import { isReserveTrialPayload, isReservedTrialResult, type ReserveTrialPayload, type ReserveTrialResult } from '@/domain/trial';
import {
  isAssignLeadPayload, isAssignedLeadResult, type AssignLeadPayload, type AssignLeadResult,
  isUpdateLeadPayload, isUpdatedLeadResult, type UpdateLeadPayload, type UpdateLeadResult,
  isAddLeadNotePayload, isCompleteTaskPayload, isCompletedTaskResult, isCreateLeadPayload, isCreatedLeadResult, isSavedLeadNoteResult,
  type AddLeadNotePayload, type AddLeadNoteResult, type CompleteTaskPayload, type CompleteTaskResult, type CreateLeadPayload, type CreateLeadResult, type TaskSubject,
} from "@/domain/crmWrites";
import {
  isChangeClassPayload, isChangedClassResult, isCreateTaskPayload, isCreatedTaskResult,
  type ChangeClassPayload, type ChangeClassResult, type CreateTaskPayload, type CreateTaskResult,
} from "@/domain/classMove";

const UNCERTAIN = ["CONCURRENT_RETRY", "BACKEND_UNAVAILABLE", "BACKEND_UNAVAILABLE_RETRY_SAME_ACTION"];

type WriteOperation = "complete_task" | "add_lead_note" | "create_lead" | "change_class" | "create_task" | "update_lead" | "assign_lead" | 'reserve_trial' | 'create_student' | 'record_trial_outcome' | 'propose_stage';
type WritePayload = CompleteTaskPayload | AddLeadNotePayload | CreateLeadPayload | ChangeClassPayload | CreateTaskPayload | UpdateLeadPayload | AssignLeadPayload | ReserveTrialPayload | CreateStudentPayload | TrialAttendancePayload | StageProposalPayload;

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
    if (code === 'FORBIDDEN') {
      const stage = response.headers.get('x-dojang-hub-error-stage');
      if (stage === 'origin') return { outcome: 'failed', code: 'REQUEST_ORIGIN_REJECTED' };
      if (stage === 'backend' && operation === 'assign_lead') return { outcome: 'failed', code: 'ODOO_ASSIGNMENT_FORBIDDEN' };
    }
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
export function updateLead(payload: UpdateLeadPayload, requestKey: string): Promise<HubAnswer<UpdateLeadResult>> {
  if (!isUpdateLeadPayload(payload)) return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
  return write('update_lead', payload, requestKey, (value): value is UpdateLeadResult => isUpdatedLeadResult(value, payload));
}
export function assignLead(payload: AssignLeadPayload, requestKey: string): Promise<HubAnswer<AssignLeadResult>> {
  if (!isAssignLeadPayload(payload)) return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
  return write('assign_lead', payload, requestKey, (value): value is AssignLeadResult => isAssignedLeadResult(value, payload));
}
export function reserveTrial(payload: ReserveTrialPayload, requestKey: string): Promise<HubAnswer<ReserveTrialResult>> {
  if (!isReserveTrialPayload(payload)) return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
  return write('reserve_trial', payload, requestKey, (value): value is ReserveTrialResult => isReservedTrialResult(value, payload));
}
export function proposeStage(payload: StageProposalPayload, requestKey: string): Promise<HubAnswer<StageProposalResult>> {
  if (!isStageProposalPayload(payload)) return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
  return write('propose_stage', payload, requestKey, (value): value is StageProposalResult => isStageProposalResult(value, payload));
}
export function recordTrialAttendance(payload: TrialAttendancePayload, leadId: string, trial: TrialRecord, requestKey: string): Promise<HubAnswer<TrialAttendanceResult>> {
  if (!isTrialAttendancePayload(payload) || trial.id !== payload.trialId) return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
  return write('record_trial_outcome', payload, requestKey, (value): value is TrialAttendanceResult => isTrialAttendanceResult(value, payload, leadId, trial));
}
export function createStudent(payload: CreateStudentPayload, requestKey: string): Promise<HubAnswer<StudentReceipt>> {
  if (!isCreateStudentPayload(payload)) return Promise.resolve({ outcome: 'failed', code: 'INVALID_COMMAND' });
  return write('create_student', payload, requestKey, (value): value is StudentReceipt => isStudentReceipt(value, payload));
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
