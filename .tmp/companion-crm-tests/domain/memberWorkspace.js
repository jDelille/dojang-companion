"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspacePayloadAllowed = workspacePayloadAllowed;
exports.projectWorkspace = projectWorkspace;
const memberActions_1 = require("./memberActions");
function workspacePayloadAllowed(v) {
    return Object.keys(v).sort().join() === 'memberId,section' && (0, memberActions_1.recordId)(v.memberId) && typeof v.section === 'string' && ['family', 'documents', 'safety', 'timeline'].includes(v.section);
}
const nullable = (v) => v === null || v === false || (0, memberActions_1.string)(v);
const timestamp = (v) => v === null || ((0, memberActions_1.string)(v) && Number.isFinite(Date.parse(v)));
const list = (v, limit, check) => Array.isArray(v) && v.length <= limit && v.every(r => (0, memberActions_1.object)(r) && check(r));
const pair = (v) => (0, memberActions_1.recordId)(v.id) && (0, memberActions_1.string)(v.name);
function projectWorkspace(raw, p) {
    if (!(0, memberActions_1.object)(raw) || !(0, memberActions_1.object)(raw.member) || raw.member.id !== p.memberId || !(0, memberActions_1.string)(raw.member.name) || typeof raw.canEdit !== 'boolean')
        return null;
    const base = { memberId: p.memberId, name: raw.member.name, section: p.section, canManage: raw.canEdit, capped: false };
    if (p.section !== 'timeline' && !raw.canEdit)
        return { ...base, data: null, unavailable: 'restricted' };
    const v = raw[p.section];
    if (v === undefined || v === null)
        return { ...base, data: null, unavailable: 'unsupported' };
    if (p.section === 'timeline') {
        if (!list(v, 50, r => (0, memberActions_1.recordId)(r.id) && r.memberId === p.memberId && (0, memberActions_1.string)(r.action) && (0, memberActions_1.string)(r.actor) && timestamp(r.at) && (r.sessionId === null || (0, memberActions_1.recordId)(r.sessionId))))
            return null;
        return { ...base, capped: v.length >= 50, data: v.map(r => ({ id: r.id, memberId: r.memberId, sessionId: r.sessionId, action: r.action, actor: r.actor, at: r.at })) };
    }
    if (!(0, memberActions_1.object)(v))
        return null;
    if (p.section === 'family') {
        if (!nullable(v.household) || !list(v.members, 500, pair) || !list(v.householdGuardians, 20, r => pair(r) && typeof r.primary === 'boolean') || !list(v.guardians, 500, r => pair(r) && (0, memberActions_1.string)(r.channel) && typeof r.allowReply === 'boolean'))
            return null;
        return { ...base, capped: v.householdGuardians.length >= 20, data: { household: v.household || null,
                members: v.members.map(r => ({ id: r.id, name: r.name })), householdGuardians: v.householdGuardians.map(r => ({ id: r.id, name: r.name, primary: r.primary })), guardians: v.guardians.map(r => ({ id: r.id, name: r.name, channel: r.channel, allowReply: r.allowReply })) } };
    }
    if (p.section === 'safety') {
        if (!nullable(v.allergies) || !nullable(v.medicalNotes) || !nullable(v.emergencyNote) || !list(v.contacts, 500, r => pair(r) && nullable(r.relationship) && nullable(r.phone) && typeof r.primary === 'boolean'))
            return null;
        return { ...base, data: { allergies: v.allergies || null, medicalNotes: v.medicalNotes || null, emergencyNote: v.emergencyNote || null,
                contacts: v.contacts.map(r => ({ id: r.id, name: r.name, relationship: r.relationship || null, phone: r.phone || null, primary: r.primary })) } };
    }
    if (!list(v.files, 30, r => pair(r) && (0, memberActions_1.string)(r.mimeType) && (0, memberActions_1.nonnegative)(r.bytes)))
        return null;
    if (v.waiver !== null && (!(0, memberActions_1.object)(v.waiver) || !(0, memberActions_1.string)(v.waiver.state) || !nullable(v.waiver.signedBy) || !timestamp(v.waiver.signedAt)))
        return null;
    return { ...base, capped: v.files.length >= 30, data: { waiver: (0, memberActions_1.object)(v.waiver) ? { state: v.waiver.state, signedBy: v.waiver.signedBy || null, signedAt: v.waiver.signedAt } : null,
            files: v.files.map(r => ({ id: r.id, name: r.name, mimeType: r.mimeType, bytes: r.bytes })) } };
}
