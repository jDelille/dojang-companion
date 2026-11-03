import { object, recordId, nonnegative, string } from './memberActions';
export type WorkspaceSection = 'family' | 'documents' | 'safety' | 'timeline';
export type WorkspacePayload = { memberId: string; section: WorkspaceSection };
export type WorkspaceResult = { memberId: string; name: string; section: WorkspaceSection; canManage: boolean;
  unavailable?: 'restricted' | 'unsupported'; data: Record<string, unknown> | Record<string, unknown>[] | null; capped: boolean };
export function workspacePayloadAllowed(v: Record<string, unknown>): v is WorkspacePayload {
  return Object.keys(v).sort().join() === 'memberId,section' && recordId(v.memberId) && typeof v.section === 'string' && ['family', 'documents', 'safety', 'timeline'].includes(v.section);
}
const nullable = (v: unknown) => v === null || v === false || string(v);
const timestamp = (v: unknown) => v === null || (string(v) && Number.isFinite(Date.parse(v)));
const list = (v: unknown, limit: number, check: (row: Record<string, unknown>) => boolean): v is Record<string, unknown>[] => Array.isArray(v) && v.length <= limit && v.every(r => object(r) && check(r));
const pair = (v: Record<string, unknown>) => recordId(v.id) && string(v.name);
export function projectWorkspace(raw: unknown, p: WorkspacePayload): WorkspaceResult | null {
  if (!object(raw) || !object(raw.member) || raw.member.id !== p.memberId || !string(raw.member.name) || typeof raw.canEdit !== 'boolean') return null;
  const base = { memberId: p.memberId, name: raw.member.name, section: p.section, canManage: raw.canEdit, capped: false };
  if (p.section !== 'timeline' && !raw.canEdit) return { ...base, data: null, unavailable: 'restricted' };
  const v = raw[p.section];
  if (v === undefined || v === null) return { ...base, data: null, unavailable: 'unsupported' };
  if (p.section === 'timeline') {
    if (!list(v, 50, r => recordId(r.id) && r.memberId === p.memberId && string(r.action) && string(r.actor) && timestamp(r.at) && (r.sessionId === null || recordId(r.sessionId)))) return null;
    return { ...base, capped: v.length >= 50, data: v.map(r => ({ id: r.id, memberId: r.memberId, sessionId: r.sessionId, action: r.action, actor: r.actor, at: r.at })) };
  }
  if (!object(v)) return null;
  if (p.section === 'family') {
    if (!nullable(v.household) || !list(v.members, 500, pair) || !list(v.householdGuardians, 20, r => pair(r) && typeof r.primary === 'boolean') || !list(v.guardians, 500, r => pair(r) && string(r.channel) && typeof r.allowReply === 'boolean')) return null;
    return { ...base, capped: v.householdGuardians.length >= 20, data: { household: v.household || null,
      members: v.members.map(r => ({ id: r.id, name: r.name })), householdGuardians: v.householdGuardians.map(r => ({ id: r.id, name: r.name, primary: r.primary })), guardians: v.guardians.map(r => ({ id: r.id, name: r.name, channel: r.channel, allowReply: r.allowReply })) } };
  }
  if (p.section === 'safety') {
    if (!nullable(v.allergies) || !nullable(v.medicalNotes) || !nullable(v.emergencyNote) || !list(v.contacts, 500, r => pair(r) && nullable(r.relationship) && nullable(r.phone) && typeof r.primary === 'boolean')) return null;
    return { ...base, data: { allergies: v.allergies || null, medicalNotes: v.medicalNotes || null, emergencyNote: v.emergencyNote || null,
      contacts: v.contacts.map(r => ({ id: r.id, name: r.name, relationship: r.relationship || null, phone: r.phone || null, primary: r.primary })) } };
  }
  if (!list(v.files, 30, r => pair(r) && string(r.mimeType) && nonnegative(r.bytes))) return null;
  if (v.waiver !== null && (!object(v.waiver) || !string(v.waiver.state) || !nullable(v.waiver.signedBy) || !timestamp(v.waiver.signedAt))) return null;
  return { ...base, capped: v.files.length >= 30, data: { waiver: object(v.waiver) ? { state: v.waiver.state, signedBy: v.waiver.signedBy || null, signedAt: v.waiver.signedAt } : null,
    files: v.files.map(r => ({ id: r.id, name: r.name, mimeType: r.mimeType, bytes: r.bytes })) } };
}
