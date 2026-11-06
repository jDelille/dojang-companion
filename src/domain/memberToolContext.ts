import { object, recordId, nonnegative, string } from './memberActions';
export type MemberToolContext = {
  member: { id: string; name: string; version: number; partnerVersion: number; email: string | null; phone: string | null; photo: string | null };
  canEdit: boolean; canEditContact: boolean;
  ranks: { id: string; name: string; maxStripes: number }[];
  bookings: { sessionId: string; title: string; startsAt: string; replaceable: boolean; attendanceState: string }[];
  attendance: { id: string; sessionId: string; title: string; checkedInAt: string; checkedOutAt: string | null }[];
  invoices: { id: string; number: string; scope: string; currency: string; remaining: number; version: number; paymentUnavailable: string | null; kind: string }[];
};
const nullable = (v: unknown): v is string | null => v === null || string(v);
const stamp = (v: unknown): v is string => string(v) && Number.isFinite(Date.parse(v));
export function memberToolContextFrom(raw: unknown, memberId: string): MemberToolContext | null {
  if (!object(raw) || !object(raw.member)) return null;
  const m = raw.member;
  if (m.id !== memberId || !string(m.name) || !nonnegative(m.version) || !nonnegative(m.partnerVersion) || !nullable(m.email) || !nullable(m.phone) || !nullable(m.photo) || typeof raw.canEdit !== 'boolean' || typeof raw.canEditContact !== 'boolean'
    || !Array.isArray(raw.ranks) || raw.ranks.length > 100 || !Array.isArray(raw.bookings) || raw.bookings.length > 100 || !Array.isArray(raw.attendance) || raw.attendance.length > 30) return null;
  const result: MemberToolContext = { member: { id: memberId, name: m.name, version: m.version, partnerVersion: m.partnerVersion, email: m.email, phone: m.phone, photo: m.photo }, canEdit: raw.canEdit, canEditContact: raw.canEditContact, ranks: [], bookings: [], attendance: [], invoices: [] };
  for (const r of raw.ranks) { if (!object(r) || !recordId(r.id) || !string(r.name) || !nonnegative(r.maxStripes)) return null; result.ranks.push({ id: r.id, name: r.name, maxStripes: r.maxStripes }); }
  for (const b of raw.bookings) { if (!object(b) || !recordId(b.sessionId) || !string(b.title) || !stamp(b.startsAt) || typeof b.replaceable !== 'boolean' || !string(b.attendanceState)) return null; result.bookings.push({ sessionId: b.sessionId, title: b.title, startsAt: b.startsAt, replaceable: b.replaceable, attendanceState: b.attendanceState }); }
  for (const a of raw.attendance) { if (!object(a) || !recordId(a.id) || !recordId(a.sessionId) || !string(a.title) || !stamp(a.checkedInAt) || !(a.checkedOutAt === null || stamp(a.checkedOutAt))) return null; result.attendance.push({ id: a.id, sessionId: a.sessionId, title: a.title, checkedInAt: a.checkedInAt, checkedOutAt: a.checkedOutAt }); }
  if (raw.canEdit && object(raw.billing)) {
    if (!Array.isArray(raw.billing.invoices) || raw.billing.invoices.length > 50) return null;
    for (const i of raw.billing.invoices) {
      if (!object(i) || !recordId(i.id) || !string(i.number) || !string(i.kind) || !['member', 'household'].includes(String(i.scope)) || !string(i.currency) || typeof i.remaining !== 'number' || !Number.isFinite(i.remaining) || !nonnegative(i.version) || !nullable(i.paymentUnavailable)) return null;
      result.invoices.push({ id: i.id, number: i.number, kind: i.kind, scope: String(i.scope), currency: i.currency, remaining: i.remaining, version: i.version, paymentUnavailable: i.paymentUnavailable });
    }
  }
  return result;
}
// registered / capacity are kept only when the Hub sends both as whole numbers
// (the trial read does; the staff schedule read may not)
export type BookableSession = { id: string; title: string; startsAt: string; version: number; registered?: number; capacity?: number };
const count = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
export function bookableSessionsFrom(raw: unknown, memberId: string): BookableSession[] | null {
  if (!object(raw) || !Array.isArray(raw.members) || !raw.members.some(m => object(m) && m.id === memberId) || !Array.isArray(raw.sessions) || raw.sessions.length > 100) return null;
  const result: BookableSession[] = [];
  for (const s of raw.sessions) {
    if (!object(s) || !recordId(s.id) || !string(s.title) || !(s.startsAt === null || stamp(s.startsAt)) || !nonnegative(s.version) || typeof s.future !== 'boolean') return null;
    if (!s.future || !s.startsAt) continue;
    const session: BookableSession = { id: s.id, title: s.title, startsAt: s.startsAt, version: s.version };
    if (count(s.registered) && count(s.capacity)) {
      session.registered = s.registered;
      session.capacity = s.capacity;
    }
    result.push(session);
  }
  return result;
}
export function memberExtraAllowed(tool: string, raw: Record<string, unknown>, memberId: string): boolean {
  const rows = (v: unknown, max: number, check: (r: Record<string, unknown>) => boolean): boolean => Array.isArray(v) && v.length <= max && v.every(r => object(r) && check(r));
  const named = (r: Record<string, unknown>) => recordId(r.id) && string(r.name);
  switch (tool) {
    case 'attendance': return rows(raw.sessions, 100, r => recordId(r.id) && string(r.title) && stamp(r.startsAt) && stamp(r.endsAt));
    case 'archive': return raw.memberId === memberId && nonnegative(raw.version) && nonnegative(raw.futureBookingCount) && nonnegative(raw.openMemberships) && nonnegative(raw.portalAccounts) && Array.isArray(raw.blockers) && raw.blockers.every(string);
    case 'pin': return raw.memberId === memberId && rows(raw.guardians, 500, r => named(r) && typeof r.hasPhone === 'boolean' && typeof r.hasPin === 'boolean' && typeof r.locked === 'boolean');
    case 'consent': return raw.memberId === memberId && rows(raw.contacts, 500, r => recordId(r.partnerId) && string(r.name) && typeof r.student === 'boolean' && rows(r.channels, 3, c => string(c.channel) && nullable(c.address) && typeof c.nativeOptOut === 'boolean' && nullable(c.service) && nullable(c.marketing)));
    case 'guardian': return raw.memberId === memberId && raw.section === 'family' && (raw.unavailable !== undefined || (object(raw.data) && Array.isArray(raw.data.householdGuardians)));
    case 'waiver': return raw.memberId === memberId && string(raw.title) && string(raw.text) && string(raw.contentVersion) && /^[a-f0-9]{64}$/.test(raw.contentVersion) && string(raw.state) && nonnegative(raw.version) && rows(raw.signers, 500, r => recordId(r.partnerId) && string(r.name) && ['self', 'guardian'].includes(String(r.relationship)));
    case 'course': return rows(raw.templates, 100, r => named(r) && nonnegative(r.version) && typeof r.autoEnroll === 'boolean') && (raw.course === null || (object(raw.course) && named(raw.course) && nonnegative(raw.course.version) && typeof raw.course.autoEnroll === 'boolean' && rows(raw.course.members, 10000, named) && rows(raw.course.candidates, 10000, named)));
    default: return true;
  }
}
