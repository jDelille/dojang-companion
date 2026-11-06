"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMBER_OPERATIONS = exports.string = exports.nonnegative = exports.recordId = exports.object = void 0;
exports.memberPayloadAllowed = memberPayloadAllowed;
exports.commandMember = commandMember;
exports.paymentUrlAllowed = paymentUrlAllowed;
exports.memberResultAllowed = memberResultAllowed;
// Narrow existing Hub commands used by Member 360. All authority stays in Odoo.
const memberCompletion_1 = require("./memberCompletion");
const object = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
exports.object = object;
const recordId = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
exports.recordId = recordId;
const nonnegative = (v) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
exports.nonnegative = nonnegative;
const string = (v) => typeof v === 'string';
exports.string = string;
const text = (v, max) => (0, exports.string)(v) && !!v.trim() && v.length <= max;
const exact = (v, fields) => Object.keys(v).sort().join() === fields.split(' ').sort().join();
const oneOf = (v, values) => typeof v === 'string' && values.includes(v);
exports.MEMBER_OPERATIONS = ['update_member', 'book', 'change_class', 'checkout', 'rank', 'update_member_photo', 'payment_link', 'archive_member', 'restore_member', 'mark_attendance', 'set_guardian_kiosk_pin', 'revoke_guardian_kiosk_pin', 'record_consent', 'link_guardian', 'sign_waiver', 'assign_course_members', 'create_task', ...memberCompletion_1.COMPLETION_OPERATIONS];
function memberPayloadAllowed(operation, p) {
    if (memberCompletion_1.COMPLETION_OPERATIONS.includes(operation))
        return (0, memberCompletion_1.completionPayloadAllowed)(operation, p);
    if (operation === 'create_task')
        return exact(p, 'relatedType relatedId summary due') && p.relatedType === 'member' && (0, exports.recordId)(p.relatedId) && text(p.summary, 200) && (0, exports.string)(p.due) && /^\d{4}-\d{2}-\d{2}$/.test(p.due) && Number.isFinite(Date.parse(p.due)) && new Date(p.due).toISOString().slice(0, 10) === p.due;
    if (operation === 'link_guardian')
        return exact(p, 'partnerId memberIds channel contactRef verificationRef allowReply') && (0, exports.recordId)(p.partnerId) && Array.isArray(p.memberIds) && p.memberIds.length === 1 && (0, exports.recordId)(p.memberIds[0]) && oneOf(p.channel, ['sms', 'whatsapp']) && text(p.contactRef, 128) && text(p.verificationRef, 300) && typeof p.allowReply === 'boolean';
    if (operation === 'assign_course_members')
        return exact(p, 'templateId expectedVersion addMemberIds removeMemberIds reason reviewToken') && (0, exports.recordId)(p.templateId) && (0, exports.nonnegative)(p.expectedVersion) && Array.isArray(p.addMemberIds) && Array.isArray(p.removeMemberIds) && p.addMemberIds.length + p.removeMemberIds.length === 1 && [...p.addMemberIds, ...p.removeMemberIds].every(exports.recordId) && text(p.reason, 500) && (0, exports.string)(p.reviewToken) && /^[a-f0-9]{64}$/.test(p.reviewToken);
    if (!(0, exports.recordId)(p.memberId))
        return false;
    switch (operation) {
        case 'update_member': return exact(p, 'memberId expectedVersion expectedPartnerVersion changes') && (0, exports.nonnegative)(p.expectedVersion) && (0, exports.nonnegative)(p.expectedPartnerVersion) && (0, exports.object)(p.changes) && Object.keys(p.changes).length > 0 && Object.entries(p.changes).every(([k, v]) => ['name', 'email', 'phone'].includes(k) && (0, exports.string)(v) && v.length <= 200 && (k !== 'name' || !!v.trim()));
        case 'book': return exact(p, 'memberId sessionId expectedVersion') && (0, exports.recordId)(p.sessionId) && (0, exports.nonnegative)(p.expectedVersion);
        case 'change_class': return exact(p, 'memberId sessionId fromSessionId expectedVersion') && (0, exports.recordId)(p.sessionId) && (0, exports.recordId)(p.fromSessionId) && p.sessionId !== p.fromSessionId && (0, exports.nonnegative)(p.expectedVersion);
        case 'checkout': return exact(p, 'memberId sessionId') && (0, exports.recordId)(p.sessionId);
        case 'rank': return exact(p, 'memberId rankId expectedVersion stripes reason') && (0, exports.recordId)(p.rankId) && (0, exports.nonnegative)(p.expectedVersion) && (0, exports.nonnegative)(p.stripes) && text(p.reason, 500);
        case 'update_member_photo': return exact(p, 'memberId expectedVersion image') && (0, exports.nonnegative)(p.expectedVersion) && (p.image === null || ((0, exports.string)(p.image) && p.image.length <= 400000 && /^[A-Za-z0-9+/]+={0,2}$/.test(p.image)));
        case 'payment_link': return exact(p, 'memberId invoiceId expectedVersion expectedAmount') && (0, exports.recordId)(p.invoiceId) && (0, exports.nonnegative)(p.expectedVersion) && typeof p.expectedAmount === 'number' && Number.isFinite(p.expectedAmount) && p.expectedAmount > 0;
        case 'archive_member':
        case 'restore_member': return exact(p, 'memberId expectedVersion reason') && (0, exports.nonnegative)(p.expectedVersion) && text(p.reason, 500);
        case 'mark_attendance': return exact(p, 'memberId sessionId status expectedVersion reason') && (0, exports.recordId)(p.sessionId) && (0, exports.nonnegative)(p.expectedVersion) && oneOf(p.status, ['present', 'late', 'absent', 'excused']) && text(p.reason, 500);
        case 'set_guardian_kiosk_pin': return exact(p, 'memberId guardianId pin reason') && (0, exports.recordId)(p.guardianId) && (0, exports.string)(p.pin) && /^\d{6}$/.test(p.pin) && text(p.reason, 500);
        case 'revoke_guardian_kiosk_pin': return exact(p, 'memberId guardianId reason') && (0, exports.recordId)(p.guardianId) && text(p.reason, 500);
        case 'record_consent': return exact(p, 'memberId partnerId channel purpose state source evidence') && (0, exports.recordId)(p.partnerId) && oneOf(p.channel, ['sms', 'email', 'whatsapp']) && oneOf(p.purpose, ['service', 'marketing']) && oneOf(p.state, ['granted', 'withdrawn']) && oneOf(p.source, ['in_person', 'paper_form', 'web_form', 'verbal', 'reply_stop']) && text(p.evidence, 500);
        case 'sign_waiver': return exact(p, 'memberId expectedVersion signerPartnerId signedByName contentVersion agreed signature') && (0, exports.nonnegative)(p.expectedVersion) && (0, exports.recordId)(p.signerPartnerId) && text(p.signedByName, 120) && (0, exports.string)(p.contentVersion) && /^[a-f0-9]{64}$/.test(p.contentVersion) && p.agreed === true && (0, exports.string)(p.signature) && p.signature.length <= 350000 && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(p.signature);
        default: return false;
    }
}
function commandMember(c) {
    if (memberCompletion_1.COMPLETION_OPERATIONS.includes(c.operation))
        return (0, exports.recordId)(c.payload.memberId) ? c.payload.memberId : c.subjectId ?? null;
    return c.operation === 'create_task' ? c.payload.relatedId : c.operation === 'link_guardian' ? c.payload.memberIds[0] : c.operation === 'assign_course_members' ? [...c.payload.addMemberIds, ...c.payload.removeMemberIds][0] : c.payload.memberId;
}
function paymentUrlAllowed(url, invoiceId, origin) {
    if (!(0, exports.string)(url) || !(0, exports.recordId)(invoiceId))
        return false;
    try {
        const u = new URL(url);
        return u.protocol === 'https:' && !u.username && !u.password && u.pathname.replace(/\/$/, '') === `/my/invoices/${invoiceId}` && (!origin || u.origin === new URL(origin).origin);
    }
    catch {
        return false;
    }
}
function memberResultAllowed(c, v) {
    if (!(0, exports.object)(v) || typeof v.replayed !== 'boolean')
        return false;
    const p = c.payload;
    if (memberCompletion_1.COMPLETION_OPERATIONS.includes(c.operation))
        return (0, memberCompletion_1.completionResultAllowed)(c.operation, p, v, c.subjectId);
    if (c.operation === 'create_task')
        return v.memberId === p.relatedId && (0, exports.recordId)(v.taskId);
    if (c.operation === 'link_guardian')
        return (0, exports.recordId)(v.bindingId) && v.state === 'verified_by_staff';
    if (c.operation === 'assign_course_members')
        return v.templateId === p.templateId && v.state === 'course_roster_updated' && JSON.stringify(v.added) === JSON.stringify(p.addMemberIds) && JSON.stringify(v.removed) === JSON.stringify(p.removeMemberIds) && (0, exports.nonnegative)(v.bookingsCreated) && (0, exports.nonnegative)(v.bookingsCancelled) && (0, exports.nonnegative)(v.version);
    if (v.memberId !== p.memberId)
        return false;
    switch (c.operation) {
        case 'update_member': return v.state === 'updated' && (0, exports.nonnegative)(v.version);
        case 'book':
        case 'change_class': return v.sessionId === p.sessionId && (0, exports.recordId)(v.enrollmentId) && v.state === 'registered';
        case 'checkout': return v.sessionId === p.sessionId && (0, exports.recordId)(v.attendanceId) && (0, exports.string)(v.checkedOutAt) && Number.isFinite(Date.parse(v.checkedOutAt));
        case 'rank': return v.state === 'awarded' && (0, exports.recordId)(v.rankHistoryId);
        case 'update_member_photo': return v.state === (p.image === null ? 'photo_removed' : 'photo_updated') && (0, exports.nonnegative)(v.version) && typeof v.hasPhoto === 'boolean';
        case 'payment_link': return v.invoiceId === p.invoiceId && v.state === 'checkout_ready' && v.amount === p.expectedAmount && (0, exports.string)(v.currency) && paymentUrlAllowed(v.checkoutUrl, p.invoiceId);
        case 'archive_member': return v.state === 'archived' && v.reason === p.reason && Array.isArray(v.cancelledBookingIds) && v.cancelledBookingIds.every(exports.recordId) && (0, exports.nonnegative)(v.courseRostersKept);
        case 'restore_member': return v.state === 'restored' && v.reason === p.reason && v.bookingsRestored === 0;
        case 'mark_attendance': return v.sessionId === p.sessionId && v.state === 'attendance_recorded' && (0, exports.recordId)(v.logId) && v.after === p.status && v.reason === p.reason && (0, exports.string)(v.before) && typeof v.reversal === 'boolean' && (0, exports.nonnegative)(v.version);
        case 'set_guardian_kiosk_pin':
        case 'revoke_guardian_kiosk_pin': return v.guardianId === p.guardianId && v.state === (c.operation === 'set_guardian_kiosk_pin' ? 'guardian_pin_set' : 'guardian_pin_revoked') && v.messageSent === false && v.reason === p.reason && !('pin' in v);
        case 'record_consent': return v.partnerId === p.partnerId && v.state === 'consent_recorded' && v.consent === p.state && v.channel === p.channel && v.purpose === p.purpose && v.messageSent === false;
        case 'sign_waiver': return v.state === 'waiver_signed' && (0, exports.recordId)(v.signatureId) && v.signedBy === p.signedByName && v.messageSent === false && (0, exports.nonnegative)(v.version) && typeof v.pdfStored === 'boolean' && !('signature' in v);
        default: return false;
    }
}
