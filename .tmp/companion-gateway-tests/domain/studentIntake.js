"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIntake = isIntake;
exports.isIntakeContextPayload = isIntakeContextPayload;
exports.isIntakePreviewPayload = isIntakePreviewPayload;
exports.isCreateStudentPayload = isCreateStudentPayload;
exports.intakeContextFrom = intakeContextFrom;
exports.intakePreviewFrom = intakePreviewFrom;
exports.isStudentReceipt = isStudentReceipt;
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const keys = (v, expected) => Object.keys(v).sort().join() === expected.split(' ').sort().join();
const id = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const ver = (v) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const str = (v, max = 200) => typeof v === 'string' && v.length <= max && !/[\x00-\x1f]/.test(v);
const date = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const contact = (v) => str(v.name) && str(v.email) && str(v.phone, 40);
function isIntake(v) {
    if (!obj(v) || !keys(v, 'studentType student guardian reviewRef') || (v.studentType !== 'adult' && v.studentType !== 'child') || !str(v.reviewRef, 300) || !v.reviewRef.trim()
        || !obj(v.student) || !keys(v.student, 'name email phone dateOfBirth gender') || !contact(v.student) || !date(v.student.dateOfBirth) || typeof v.student.gender !== 'string' || !['', 'male', 'female', 'other'].includes(v.student.gender))
        return false;
    if (v.studentType === 'adult')
        return v.guardian === null;
    const g = v.guardian;
    return obj(g) && (g.kind === 'new' ? keys(g, 'kind name email phone') && contact(g) : g.kind === 'existing' && keys(g, 'kind partnerId householdId expectedVersion expectedHouseholdVersion') && id(g.partnerId) && id(g.householdId) && ver(g.expectedVersion) && ver(g.expectedHouseholdVersion));
}
function isIntakeContextPayload(v) { return obj(v) && keys(v, 'query') && str(v.query, 100); }
function isIntakePreviewPayload(v) { return obj(v) && keys(v, 'intake') && isIntake(v.intake); }
function isCreateStudentPayload(v) { return obj(v) && keys(v, 'intake reviewToken') && isIntake(v.intake) && typeof v.reviewToken === 'string' && /^[a-f0-9]{64}$/.test(v.reviewToken); }
function guardian(v) { return obj(v) && id(v.id) && str(v.name) && id(v.householdId) && str(v.household) && ver(v.version) && ver(v.householdVersion); }
function intakeContextFrom(v) {
    if (!obj(v) || !Array.isArray(v.guardians) || v.guardians.length > 50 || !v.guardians.every(guardian) || new Set(v.guardians.map(g => g.id)).size !== v.guardians.length || typeof v.moreGuardians !== 'boolean' || !str(v.school) || !date(v.today))
        return null;
    return { guardians: v.guardians.map(g => ({ id: g.id, name: g.name, householdId: g.householdId, household: g.household, version: g.version, householdVersion: g.householdVersion })), moreGuardians: v.moreGuardians, school: v.school, today: v.today };
}
function intakePreviewFrom(v) {
    if (!obj(v))
        return null;
    if (v.valid === true) {
        if (!isCreateStudentPayload({ intake: v.intake, reviewToken: v.reviewToken }) || !(v.guardianName === null || str(v.guardianName)) || !(v.householdName === null || str(v.householdName))
            || v.state !== 'profile_only' || v.subscriptionCreated !== false || v.enrollmentCreated !== false || v.portalAccessGranted !== false || v.messageSent !== false)
            return null;
        return { valid: true, intake: v.intake, reviewToken: v.reviewToken, guardianName: v.guardianName, householdName: v.householdName };
    }
    if (v.valid !== false || !str(v.code) || !Array.isArray(v.issues) || v.issues.length > 50 || !v.issues.every(i => obj(i) && str(i.field) && str(i.message, 1000)))
        return null;
    const students = v.duplicateStudents === undefined ? [] : v.duplicateStudents, guardians = v.guardianMatches === undefined ? [] : v.guardianMatches;
    if (!Array.isArray(students) || students.length > 10 || !students.every(s => obj(s) && id(s.memberId) && str(s.name) && str(s.memberNumber) && typeof s.active === 'boolean') || !Array.isArray(guardians) || guardians.length > 10 || !guardians.every(guardian) || (v.unselectableGuardianMatch !== undefined && typeof v.unselectableGuardianMatch !== 'boolean'))
        return null;
    return { valid: false, code: v.code, issues: v.issues.map(i => ({ field: i.field, message: i.message })), duplicateStudents: students.map(s => ({ memberId: s.memberId, name: s.name, memberNumber: s.memberNumber, active: s.active })), guardianMatches: guardians.map(g => ({ id: g.id, name: g.name, householdId: g.householdId, household: g.household, version: g.version, householdVersion: g.householdVersion })), unselectableGuardianMatch: v.unselectableGuardianMatch === true };
}
function isStudentReceipt(v, p) {
    if (!obj(v) || v.state !== 'student_created' || !id(v.memberId) || !str(v.memberNumber) || !v.memberNumber.trim() || v.reviewRef !== p.intake.reviewRef || v.subscriptionCreated !== false || v.enrollmentCreated !== false || v.portalAccessGranted !== false || v.messageSent !== false || typeof v.replayed !== 'boolean')
        return false;
    const g = p.intake.guardian;
    if (p.intake.studentType === 'adult')
        return v.guardianId === null && v.householdId === null;
    return !!g && id(v.guardianId) && id(v.householdId) && (g.kind === 'new' || (v.guardianId === g.partnerId && v.householdId === g.householdId));
}
