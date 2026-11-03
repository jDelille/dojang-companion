// Existing Hub intake.py / intake_validation.py contracts. No enrollment or lead mutation.
export type Guardian = { id: string; name: string; householdId: string; household: string; version: number; householdVersion: number };
export type Intake = { studentType: 'adult' | 'child'; student: { name: string; email: string; phone: string; dateOfBirth: string; gender: '' | 'male' | 'female' | 'other' };
  guardian: null | { kind: 'new'; name: string; email: string; phone: string } | { kind: 'existing'; partnerId: string; householdId: string; expectedVersion: number; expectedHouseholdVersion: number }; reviewRef: string };
export type IntakeContext = { guardians: Guardian[]; moreGuardians: boolean; school: string; today: string };
export type IntakePreview = { valid: true; intake: Intake; reviewToken: string; guardianName: string | null; householdName: string | null } |
  { valid: false; code: string; issues: { field: string; message: string }[]; duplicateStudents: { memberId: string; name: string; memberNumber: string; active: boolean }[]; guardianMatches: Guardian[]; unselectableGuardianMatch: boolean };
export type CreateStudentPayload = { intake: Intake; reviewToken: string };
export type StudentReceipt = { state: 'student_created'; memberId: string; memberNumber: string; guardianId: string | null; householdId: string | null; reviewRef: string;
  subscriptionCreated: false; enrollmentCreated: false; portalAccessGranted: false; messageSent: false; replayed: boolean };
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const keys = (v: Record<string, unknown>, expected: string) => Object.keys(v).sort().join() === expected.split(' ').sort().join();
const id = (v: unknown): v is string => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const ver = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const str = (v: unknown, max = 200): v is string => typeof v === 'string' && v.length <= max && !/[\x00-\x1f]/.test(v);
const date = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const contact = (v: Record<string, unknown>) => str(v.name) && str(v.email) && str(v.phone, 40);
export function isIntake(v: unknown): v is Intake {
  if (!obj(v) || !keys(v, 'studentType student guardian reviewRef') || (v.studentType !== 'adult' && v.studentType !== 'child') || !str(v.reviewRef, 300) || !v.reviewRef.trim()
    || !obj(v.student) || !keys(v.student, 'name email phone dateOfBirth gender') || !contact(v.student) || !date(v.student.dateOfBirth) || typeof v.student.gender !== 'string' || !['', 'male', 'female', 'other'].includes(v.student.gender)) return false;
  if (v.studentType === 'adult') return v.guardian === null;
  const g = v.guardian;
  return obj(g) && (g.kind === 'new' ? keys(g, 'kind name email phone') && contact(g) : g.kind === 'existing' && keys(g, 'kind partnerId householdId expectedVersion expectedHouseholdVersion') && id(g.partnerId) && id(g.householdId) && ver(g.expectedVersion) && ver(g.expectedHouseholdVersion));
}
export function isIntakeContextPayload(v: unknown): v is { query: string } { return obj(v) && keys(v, 'query') && str(v.query, 100); }
export function isIntakePreviewPayload(v: unknown): v is { intake: Intake } { return obj(v) && keys(v, 'intake') && isIntake(v.intake); }
export function isCreateStudentPayload(v: unknown): v is CreateStudentPayload { return obj(v) && keys(v, 'intake reviewToken') && isIntake(v.intake) && typeof v.reviewToken === 'string' && /^[a-f0-9]{64}$/.test(v.reviewToken); }
function guardian(v: unknown): v is Guardian { return obj(v) && id(v.id) && str(v.name) && id(v.householdId) && str(v.household) && ver(v.version) && ver(v.householdVersion); }
export function intakeContextFrom(v: unknown): IntakeContext | null {
  if (!obj(v) || !Array.isArray(v.guardians) || v.guardians.length > 50 || !v.guardians.every(guardian) || new Set(v.guardians.map(g => g.id)).size !== v.guardians.length || typeof v.moreGuardians !== 'boolean' || !str(v.school) || !date(v.today)) return null;
  return { guardians: v.guardians.map(g => ({ id: g.id, name: g.name, householdId: g.householdId, household: g.household, version: g.version, householdVersion: g.householdVersion })), moreGuardians: v.moreGuardians, school: v.school, today: v.today };
}
export function intakePreviewFrom(v: unknown): IntakePreview | null {
  if (!obj(v)) return null;
  if (v.valid === true) {
    if (!isCreateStudentPayload({ intake: v.intake, reviewToken: v.reviewToken }) || !(v.guardianName === null || str(v.guardianName)) || !(v.householdName === null || str(v.householdName))
      || v.state !== 'profile_only' || v.subscriptionCreated !== false || v.enrollmentCreated !== false || v.portalAccessGranted !== false || v.messageSent !== false) return null;
    return { valid: true, intake: v.intake as Intake, reviewToken: v.reviewToken as string, guardianName: v.guardianName, householdName: v.householdName };
  }
  if (v.valid !== false || !str(v.code) || !Array.isArray(v.issues) || v.issues.length > 50 || !v.issues.every(i => obj(i) && str(i.field) && str(i.message, 1000))) return null;
  const students = v.duplicateStudents === undefined ? [] : v.duplicateStudents, guardians = v.guardianMatches === undefined ? [] : v.guardianMatches;
  if (!Array.isArray(students) || students.length > 10 || !students.every(s => obj(s) && id(s.memberId) && str(s.name) && str(s.memberNumber) && typeof s.active === 'boolean') || !Array.isArray(guardians) || guardians.length > 10 || !guardians.every(guardian) || (v.unselectableGuardianMatch !== undefined && typeof v.unselectableGuardianMatch !== 'boolean')) return null;
  return { valid: false, code: v.code, issues: v.issues.map(i => ({ field: i.field, message: i.message })), duplicateStudents: students.map(s => ({ memberId: s.memberId, name: s.name, memberNumber: s.memberNumber, active: s.active })), guardianMatches: guardians.map(g => ({ id: g.id, name: g.name, householdId: g.householdId, household: g.household, version: g.version, householdVersion: g.householdVersion })), unselectableGuardianMatch: v.unselectableGuardianMatch === true };
}
export function isStudentReceipt(v: unknown, p: CreateStudentPayload): v is StudentReceipt {
  if (!obj(v) || v.state !== 'student_created' || !id(v.memberId) || !str(v.memberNumber) || !v.memberNumber.trim() || v.reviewRef !== p.intake.reviewRef || v.subscriptionCreated !== false || v.enrollmentCreated !== false || v.portalAccessGranted !== false || v.messageSent !== false || typeof v.replayed !== 'boolean') return false;
  const g = p.intake.guardian;
  if (p.intake.studentType === 'adult') return v.guardianId === null && v.householdId === null;
  return !!g && id(v.guardianId) && id(v.householdId) && (g.kind === 'new' || (v.guardianId === g.partnerId && v.householdId === g.householdId));
}
