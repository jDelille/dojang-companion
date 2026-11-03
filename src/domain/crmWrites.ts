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

// create_lead (crm.py _create_lead): exactly these four fields; the Hub puts the
// lead in the first intake stage, unassigned. Owners and managers only.
export type CreateLeadPayload = { name: string; contact: string; email: string; phone: string };
export type CreateLeadResult = { leadId: string; version: number; replayed: boolean };
const field = (value: unknown) => typeof value === "string" && value.length <= 200;
export function isCreateLeadPayload(value: unknown): value is CreateLeadPayload {
  return object(value) && Object.keys(value).sort().join() === "contact,email,name,phone"
    && field(value.name) && text(value.name, 200) && field(value.contact) && field(value.phone)
    && field(value.email) && (value.email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value.email).trim()));
}
export function isCreatedLeadResult(value: unknown): value is CreateLeadResult {
  return object(value) && id(value.leadId) && version(value.version) && typeof value.replayed === "boolean";
}

// Hub crm.py _update_lead: partial contact fields, optimistic version and receipt.
export type LeadContactFields = CreateLeadPayload;
export type UpdateLeadPayload = { leadId: string; expectedVersion: number; changes: Partial<LeadContactFields> };
export type UpdateLeadResult = CreateLeadResult;
export type AssignLeadPayload = { leadId: string; expectedVersion: number; ownerId: string };
export type AssignLeadResult = { leadId: string; ownerId: string; state: 'assigned'; replayed: boolean };
export function isAssignLeadPayload(value: unknown): value is AssignLeadPayload {
  return object(value) && Object.keys(value).sort().join() === 'expectedVersion,leadId,ownerId'
    && id(value.leadId) && version(value.expectedVersion) && id(value.ownerId);
}
export function isAssignedLeadResult(value: unknown, payload: AssignLeadPayload): value is AssignLeadResult {
  return object(value) && value.leadId === payload.leadId && value.ownerId === payload.ownerId
    && value.state === 'assigned' && typeof value.replayed === 'boolean';
}
export function isUpdateLeadPayload(value: unknown): value is UpdateLeadPayload {
  if (!object(value) || Object.keys(value).sort().join() !== 'changes,expectedVersion,leadId'
    || !id(value.leadId) || !version(value.expectedVersion) || !object(value.changes)) return false;
  const entries = Object.entries(value.changes);
  return entries.length > 0 && entries.every(([key, v]) => ['name', 'contact', 'email', 'phone'].includes(key)
    && field(v) && (key !== 'name' || text(v, 200))
    && (key !== 'email' || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())));
}
export function isUpdatedLeadResult(value: unknown, payload: UpdateLeadPayload): value is UpdateLeadResult {
  return isCreatedLeadResult(value) && value.leadId === payload.leadId && value.version >= payload.expectedVersion;
}
export function changedLeadFields(original: LeadContactFields, draft: LeadContactFields): Partial<LeadContactFields> {
  const changes: Partial<LeadContactFields> = {};
  for (const key of ['name', 'contact', 'email', 'phone'] as const) {
    if (draft[key] === original[key]) continue;
    const value = draft[key].trim();
    if (value !== original[key]) changes[key] = value;
  }
  return changes;
}
