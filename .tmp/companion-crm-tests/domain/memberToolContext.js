"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberToolContextFrom = memberToolContextFrom;
exports.bookableSessionsFrom = bookableSessionsFrom;
exports.memberExtraAllowed = memberExtraAllowed;
const memberActions_1 = require("./memberActions");
const nullable = (v) => v === null || (0, memberActions_1.string)(v);
const stamp = (v) => (0, memberActions_1.string)(v) && Number.isFinite(Date.parse(v));
function memberToolContextFrom(raw, memberId) {
    if (!(0, memberActions_1.object)(raw) || !(0, memberActions_1.object)(raw.member))
        return null;
    const m = raw.member;
    if (m.id !== memberId || !(0, memberActions_1.string)(m.name) || !(0, memberActions_1.nonnegative)(m.version) || !(0, memberActions_1.nonnegative)(m.partnerVersion) || !nullable(m.email) || !nullable(m.phone) || !nullable(m.photo) || typeof raw.canEdit !== 'boolean' || typeof raw.canEditContact !== 'boolean'
        || !Array.isArray(raw.ranks) || raw.ranks.length > 100 || !Array.isArray(raw.bookings) || raw.bookings.length > 100 || !Array.isArray(raw.attendance) || raw.attendance.length > 30)
        return null;
    const result = { member: { id: memberId, name: m.name, version: m.version, partnerVersion: m.partnerVersion, email: m.email, phone: m.phone, photo: m.photo }, canEdit: raw.canEdit, canEditContact: raw.canEditContact, ranks: [], bookings: [], attendance: [], invoices: [] };
    for (const r of raw.ranks) {
        if (!(0, memberActions_1.object)(r) || !(0, memberActions_1.recordId)(r.id) || !(0, memberActions_1.string)(r.name) || !(0, memberActions_1.nonnegative)(r.maxStripes))
            return null;
        result.ranks.push({ id: r.id, name: r.name, maxStripes: r.maxStripes });
    }
    for (const b of raw.bookings) {
        if (!(0, memberActions_1.object)(b) || !(0, memberActions_1.recordId)(b.sessionId) || !(0, memberActions_1.string)(b.title) || !stamp(b.startsAt) || typeof b.replaceable !== 'boolean' || !(0, memberActions_1.string)(b.attendanceState))
            return null;
        result.bookings.push({ sessionId: b.sessionId, title: b.title, startsAt: b.startsAt, replaceable: b.replaceable, attendanceState: b.attendanceState });
    }
    for (const a of raw.attendance) {
        if (!(0, memberActions_1.object)(a) || !(0, memberActions_1.recordId)(a.id) || !(0, memberActions_1.recordId)(a.sessionId) || !(0, memberActions_1.string)(a.title) || !stamp(a.checkedInAt) || !(a.checkedOutAt === null || stamp(a.checkedOutAt)))
            return null;
        result.attendance.push({ id: a.id, sessionId: a.sessionId, title: a.title, checkedInAt: a.checkedInAt, checkedOutAt: a.checkedOutAt });
    }
    if (raw.canEdit && (0, memberActions_1.object)(raw.billing)) {
        if (!Array.isArray(raw.billing.invoices) || raw.billing.invoices.length > 50)
            return null;
        for (const i of raw.billing.invoices) {
            if (!(0, memberActions_1.object)(i) || !(0, memberActions_1.recordId)(i.id) || !(0, memberActions_1.string)(i.number) || !(0, memberActions_1.string)(i.kind) || !['member', 'household'].includes(String(i.scope)) || !(0, memberActions_1.string)(i.currency) || typeof i.remaining !== 'number' || !Number.isFinite(i.remaining) || !(0, memberActions_1.nonnegative)(i.version) || !nullable(i.paymentUnavailable))
                return null;
            result.invoices.push({ id: i.id, number: i.number, kind: i.kind, scope: String(i.scope), currency: i.currency, remaining: i.remaining, version: i.version, paymentUnavailable: i.paymentUnavailable });
        }
    }
    return result;
}
const count = (v) => Number.isInteger(v) && v >= 0;
function bookableSessionsFrom(raw, memberId) {
    if (!(0, memberActions_1.object)(raw) || !Array.isArray(raw.members) || !raw.members.some(m => (0, memberActions_1.object)(m) && m.id === memberId) || !Array.isArray(raw.sessions) || raw.sessions.length > 100)
        return null;
    const result = [];
    for (const s of raw.sessions) {
        if (!(0, memberActions_1.object)(s) || !(0, memberActions_1.recordId)(s.id) || !(0, memberActions_1.string)(s.title) || !(s.startsAt === null || stamp(s.startsAt)) || !(0, memberActions_1.nonnegative)(s.version) || typeof s.future !== 'boolean')
            return null;
        if (!s.future || !s.startsAt)
            continue;
        const session = { id: s.id, title: s.title, startsAt: s.startsAt, version: s.version };
        if (count(s.registered) && count(s.capacity)) {
            session.registered = s.registered;
            session.capacity = s.capacity;
        }
        result.push(session);
    }
    return result;
}
function memberExtraAllowed(tool, raw, memberId) {
    const rows = (v, max, check) => Array.isArray(v) && v.length <= max && v.every(r => (0, memberActions_1.object)(r) && check(r));
    const named = (r) => (0, memberActions_1.recordId)(r.id) && (0, memberActions_1.string)(r.name);
    switch (tool) {
        case 'attendance': return rows(raw.sessions, 100, r => (0, memberActions_1.recordId)(r.id) && (0, memberActions_1.string)(r.title) && stamp(r.startsAt) && stamp(r.endsAt));
        case 'archive': return raw.memberId === memberId && (0, memberActions_1.nonnegative)(raw.version) && (0, memberActions_1.nonnegative)(raw.futureBookingCount) && (0, memberActions_1.nonnegative)(raw.openMemberships) && (0, memberActions_1.nonnegative)(raw.portalAccounts) && Array.isArray(raw.blockers) && raw.blockers.every(memberActions_1.string);
        case 'pin': return raw.memberId === memberId && rows(raw.guardians, 500, r => named(r) && typeof r.hasPhone === 'boolean' && typeof r.hasPin === 'boolean' && typeof r.locked === 'boolean');
        case 'consent': return raw.memberId === memberId && rows(raw.contacts, 500, r => (0, memberActions_1.recordId)(r.partnerId) && (0, memberActions_1.string)(r.name) && typeof r.student === 'boolean' && rows(r.channels, 3, c => (0, memberActions_1.string)(c.channel) && nullable(c.address) && typeof c.nativeOptOut === 'boolean' && nullable(c.service) && nullable(c.marketing)));
        case 'guardian': return raw.memberId === memberId && raw.section === 'family' && (raw.unavailable !== undefined || ((0, memberActions_1.object)(raw.data) && Array.isArray(raw.data.householdGuardians)));
        case 'waiver': return raw.memberId === memberId && (0, memberActions_1.string)(raw.title) && (0, memberActions_1.string)(raw.text) && (0, memberActions_1.string)(raw.contentVersion) && /^[a-f0-9]{64}$/.test(raw.contentVersion) && (0, memberActions_1.string)(raw.state) && (0, memberActions_1.nonnegative)(raw.version) && rows(raw.signers, 500, r => (0, memberActions_1.recordId)(r.partnerId) && (0, memberActions_1.string)(r.name) && ['self', 'guardian'].includes(String(r.relationship)));
        case 'course': return rows(raw.templates, 100, r => named(r) && (0, memberActions_1.nonnegative)(r.version) && typeof r.autoEnroll === 'boolean') && (raw.course === null || ((0, memberActions_1.object)(raw.course) && named(raw.course) && (0, memberActions_1.nonnegative)(raw.course.version) && typeof raw.course.autoEnroll === 'boolean' && rows(raw.course.members, 10000, named) && rows(raw.course.candidates, 10000, named)));
        default: return true;
    }
}
