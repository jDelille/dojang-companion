// Narrow existing Hub commands used by Member 360. All authority stays in Odoo.
import { COMPLETION_OPERATIONS, completionPayloadAllowed, completionResultAllowed } from './memberCompletion';
export const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const recordId = (v: unknown): v is string => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
export const nonnegative = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
export const string = (v: unknown): v is string => typeof v === 'string';
const text = (v: unknown, max: number) => string(v) && !!v.trim() && v.length <= max;
const exact = (v: Record<string, unknown>, fields: string) => Object.keys(v).sort().join() === fields.split(' ').sort().join();
const oneOf = (v: unknown, values: string[]) => typeof v === 'string' && values.includes(v);
export const MEMBER_OPERATIONS = ['update_member', 'book', 'change_class', 'checkout', 'rank', 'update_member_photo', 'payment_link', 'archive_member', 'restore_member', 'mark_attendance', 'set_guardian_kiosk_pin', 'revoke_guardian_kiosk_pin', 'record_consent', 'link_guardian', 'sign_waiver', 'assign_course_members', 'create_task', ...COMPLETION_OPERATIONS] as const;
export type MemberOperation = typeof MEMBER_OPERATIONS[number];
export type MemberCommand = { operation: MemberOperation; payload: Record<string, unknown>; subjectId?: string };
export function memberPayloadAllowed(operation: MemberOperation, p: Record<string, unknown>): boolean {
  if ((COMPLETION_OPERATIONS as readonly string[]).includes(operation)) return completionPayloadAllowed(operation, p);
  if (operation === 'create_task') return exact(p, 'relatedType relatedId summary due') && p.relatedType === 'member' && recordId(p.relatedId) && text(p.summary, 200) && string(p.due) && /^\d{4}-\d{2}-\d{2}$/.test(p.due) && Number.isFinite(Date.parse(p.due)) && new Date(p.due).toISOString().slice(0, 10) === p.due;
  if (operation === 'link_guardian') return exact(p, 'partnerId memberIds channel contactRef verificationRef allowReply') && recordId(p.partnerId) && Array.isArray(p.memberIds) && p.memberIds.length === 1 && recordId(p.memberIds[0]) && oneOf(p.channel, ['sms', 'whatsapp']) && text(p.contactRef, 128) && text(p.verificationRef, 300) && typeof p.allowReply === 'boolean';
  if (operation === 'assign_course_members') return exact(p, 'templateId expectedVersion addMemberIds removeMemberIds reason reviewToken') && recordId(p.templateId) && nonnegative(p.expectedVersion) && Array.isArray(p.addMemberIds) && Array.isArray(p.removeMemberIds) && p.addMemberIds.length + p.removeMemberIds.length === 1 && [...p.addMemberIds, ...p.removeMemberIds].every(recordId) && text(p.reason, 500) && string(p.reviewToken) && /^[a-f0-9]{64}$/.test(p.reviewToken);
  if (!recordId(p.memberId)) return false;
  switch (operation) {
    case 'update_member': return exact(p, 'memberId expectedVersion expectedPartnerVersion changes') && nonnegative(p.expectedVersion) && nonnegative(p.expectedPartnerVersion) && object(p.changes) && Object.keys(p.changes).length > 0 && Object.entries(p.changes).every(([k, v]) => ['name', 'email', 'phone'].includes(k) && string(v) && v.length <= 200 && (k !== 'name' || !!v.trim()));
    case 'book': return exact(p, 'memberId sessionId expectedVersion') && recordId(p.sessionId) && nonnegative(p.expectedVersion);
    case 'change_class': return exact(p, 'memberId sessionId fromSessionId expectedVersion') && recordId(p.sessionId) && recordId(p.fromSessionId) && p.sessionId !== p.fromSessionId && nonnegative(p.expectedVersion);
    case 'checkout': return exact(p, 'memberId sessionId') && recordId(p.sessionId);
    case 'rank': return exact(p, 'memberId rankId expectedVersion stripes reason') && recordId(p.rankId) && nonnegative(p.expectedVersion) && nonnegative(p.stripes) && text(p.reason, 500);
    case 'update_member_photo': return exact(p, 'memberId expectedVersion image') && nonnegative(p.expectedVersion) && (p.image === null || (string(p.image) && p.image.length <= 400000 && /^[A-Za-z0-9+/]+={0,2}$/.test(p.image)));
    case 'payment_link': return exact(p, 'memberId invoiceId expectedVersion expectedAmount') && recordId(p.invoiceId) && nonnegative(p.expectedVersion) && typeof p.expectedAmount === 'number' && Number.isFinite(p.expectedAmount) && p.expectedAmount > 0;
    case 'archive_member': case 'restore_member': return exact(p, 'memberId expectedVersion reason') && nonnegative(p.expectedVersion) && text(p.reason, 500);
    case 'mark_attendance': return exact(p, 'memberId sessionId status expectedVersion reason') && recordId(p.sessionId) && nonnegative(p.expectedVersion) && oneOf(p.status, ['present', 'late', 'absent', 'excused']) && text(p.reason, 500);
    case 'set_guardian_kiosk_pin': return exact(p, 'memberId guardianId pin reason') && recordId(p.guardianId) && string(p.pin) && /^\d{6}$/.test(p.pin) && text(p.reason, 500);
    case 'revoke_guardian_kiosk_pin': return exact(p, 'memberId guardianId reason') && recordId(p.guardianId) && text(p.reason, 500);
    case 'record_consent': return exact(p, 'memberId partnerId channel purpose state source evidence') && recordId(p.partnerId) && oneOf(p.channel, ['sms', 'email', 'whatsapp']) && oneOf(p.purpose, ['service', 'marketing']) && oneOf(p.state, ['granted', 'withdrawn']) && oneOf(p.source, ['in_person', 'paper_form', 'web_form', 'verbal', 'reply_stop']) && text(p.evidence, 500);
    case 'sign_waiver': return exact(p, 'memberId expectedVersion signerPartnerId signedByName contentVersion agreed signature') && nonnegative(p.expectedVersion) && recordId(p.signerPartnerId) && text(p.signedByName, 120) && string(p.contentVersion) && /^[a-f0-9]{64}$/.test(p.contentVersion) && p.agreed === true && string(p.signature) && p.signature.length <= 350000 && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(p.signature);
    default: return false;
  }
}
export function commandMember(c: MemberCommand): string | null {
  if ((COMPLETION_OPERATIONS as readonly string[]).includes(c.operation)) return recordId(c.payload.memberId) ? c.payload.memberId : c.subjectId ?? null;
  return c.operation === 'create_task' ? c.payload.relatedId as string : c.operation === 'link_guardian' ? (c.payload.memberIds as string[])[0] : c.operation === 'assign_course_members' ? [...c.payload.addMemberIds as string[], ...c.payload.removeMemberIds as string[]][0] : c.payload.memberId as string;
}
export function paymentUrlAllowed(url: unknown, invoiceId: unknown, origin?: string): boolean {
  if (!string(url) || !recordId(invoiceId)) return false;
  try { const u = new URL(url); return u.protocol === 'https:' && !u.username && !u.password && u.pathname.replace(/\/$/, '') === `/my/invoices/${invoiceId}` && (!origin || u.origin === new URL(origin).origin); } catch { return false; }
}
export function memberResultAllowed(c: MemberCommand, v: unknown): v is Record<string, unknown> {
  if (!object(v) || typeof v.replayed !== 'boolean') return false;
  const p = c.payload;
  if ((COMPLETION_OPERATIONS as readonly string[]).includes(c.operation)) return completionResultAllowed(c.operation, p, v, c.subjectId);
  if (c.operation === 'create_task') return v.memberId === p.relatedId && recordId(v.taskId);
  if (c.operation === 'link_guardian') return recordId(v.bindingId) && v.state === 'verified_by_staff';
  if (c.operation === 'assign_course_members') return v.templateId === p.templateId && v.state === 'course_roster_updated' && JSON.stringify(v.added) === JSON.stringify(p.addMemberIds) && JSON.stringify(v.removed) === JSON.stringify(p.removeMemberIds) && nonnegative(v.bookingsCreated) && nonnegative(v.bookingsCancelled) && nonnegative(v.version);
  if (v.memberId !== p.memberId) return false;
  switch (c.operation) {
    case 'update_member': return v.state === 'updated' && nonnegative(v.version);
    case 'book': case 'change_class': return v.sessionId === p.sessionId && recordId(v.enrollmentId) && v.state === 'registered';
    case 'checkout': return v.sessionId === p.sessionId && recordId(v.attendanceId) && string(v.checkedOutAt) && Number.isFinite(Date.parse(v.checkedOutAt));
    case 'rank': return v.state === 'awarded' && recordId(v.rankHistoryId);
    case 'update_member_photo': return v.state === (p.image === null ? 'photo_removed' : 'photo_updated') && nonnegative(v.version) && typeof v.hasPhoto === 'boolean';
    case 'payment_link': return v.invoiceId === p.invoiceId && v.state === 'checkout_ready' && v.amount === p.expectedAmount && string(v.currency) && paymentUrlAllowed(v.checkoutUrl, p.invoiceId);
    case 'archive_member': return v.state === 'archived' && v.reason === p.reason && Array.isArray(v.cancelledBookingIds) && v.cancelledBookingIds.every(recordId) && nonnegative(v.courseRostersKept);
    case 'restore_member': return v.state === 'restored' && v.reason === p.reason && v.bookingsRestored === 0;
    case 'mark_attendance': return v.sessionId === p.sessionId && v.state === 'attendance_recorded' && recordId(v.logId) && v.after === p.status && v.reason === p.reason && string(v.before) && typeof v.reversal === 'boolean' && nonnegative(v.version);
    case 'set_guardian_kiosk_pin': case 'revoke_guardian_kiosk_pin': return v.guardianId === p.guardianId && v.state === (c.operation === 'set_guardian_kiosk_pin' ? 'guardian_pin_set' : 'guardian_pin_revoked') && v.messageSent === false && v.reason === p.reason && !('pin' in v);
    case 'record_consent': return v.partnerId === p.partnerId && v.state === 'consent_recorded' && v.consent === p.state && v.channel === p.channel && v.purpose === p.purpose && v.messageSent === false;
    case 'sign_waiver': return v.state === 'waiver_signed' && recordId(v.signatureId) && v.signedBy === p.signedByName && v.messageSent === false && nonnegative(v.version) && typeof v.pdfStored === 'boolean' && !('signature' in v);
    default: return false;
  }
}
