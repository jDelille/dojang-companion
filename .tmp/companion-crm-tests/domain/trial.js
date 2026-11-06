"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTrialAttendancePayload = isTrialAttendancePayload;
exports.isTrialAttendanceResult = isTrialAttendanceResult;
exports.isTrialContextPayload = isTrialContextPayload;
exports.isReserveTrialPayload = isReserveTrialPayload;
exports.isReservedTrialResult = isReservedTrialResult;
exports.trialContextFrom = trialContextFrom;
const object = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const integer = (v) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const text = (v) => typeof v === 'string';
const timestamp = (v) => text(v) && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
const nullableText = (v) => v === null || text(v);
const unique = (rows) => new Set(rows.map(r => r.id)).size === rows.length;
function isTrialAttendancePayload(v) {
    return object(v) && Object.keys(v).sort().join() === 'expectedVersion,outcome,reason,trialId' && id(v.trialId)
        && integer(v.expectedVersion) && v.outcome === 'attended' && text(v.reason) && !!v.reason.trim() && v.reason.length <= 500;
}
function isTrialAttendanceResult(v, p, leadId, trial) {
    return object(v) && v.trialId === p.trialId && id(v.leadId) && id(v.memberId) && id(v.sessionId) && id(v.attendanceId)
        && (leadId === undefined || v.leadId === leadId) && (trial === undefined || (trial.id === p.trialId && v.memberId === trial.member.id && v.sessionId === trial.session.id))
        && v.state === 'trial_attended' && v.reason === p.reason && v.stageChanged === false && v.messageSent === false
        && v.noShowFollowUpScheduled === false && typeof v.replayed === 'boolean';
}
function isTrialContextPayload(v) {
    return object(v) && Object.keys(v).sort().join() === 'leadId,query' && id(v.leadId) && text(v.query) && v.query.length <= 100;
}
function isReserveTrialPayload(v) {
    return object(v) && Object.keys(v).sort().join() === 'expectedLeadVersion,expectedSessionVersion,leadId,memberId,reason,sessionId'
        && id(v.leadId) && id(v.memberId) && id(v.sessionId) && integer(v.expectedLeadVersion) && integer(v.expectedSessionVersion)
        && text(v.reason) && !!v.reason.trim() && v.reason.length <= 500;
}
function isReservedTrialResult(v, p) {
    return object(v) && id(v.trialId) && id(v.enrollmentId) && v.leadId === p.leadId && v.memberId === p.memberId
        && v.sessionId === p.sessionId && v.state === 'trial_reserved' && v.reason === p.reason
        && v.stageChanged === false && v.messageSent === false && v.membershipCreated === false && typeof v.replayed === 'boolean'
        && v.paymentCollected !== true && v.portalAccessGranted !== true;
}
function trialContextFrom(v, leadId) {
    if (!object(v) || !object(v.lead) || v.lead.id !== leadId || !text(v.lead.name) || !integer(v.lead.version)
        || !nullableText(v.lead.stage) || !nullableText(v.lead.contact) || !Array.isArray(v.students) || !Array.isArray(v.sessions)
        || !Array.isArray(v.trials) || v.students.length > 20 || v.sessions.length > 100 || v.trials.length > 20)
        return null;
    const students = [], sessions = [], trials = [];
    for (const s of v.students) {
        if (!object(s) || !id(s.id) || !text(s.name) || !s.name.trim() || !text(s.memberNumber) || !text(s.state))
            return null;
        students.push({ id: s.id, name: s.name, memberNumber: s.memberNumber, state: s.state });
    }
    for (const s of v.sessions) {
        if (!object(s) || !id(s.id) || !text(s.title) || !timestamp(s.startsAt) || !integer(s.version)
            || !integer(s.registered) || !integer(s.capacity) || typeof s.courseRoster !== 'boolean')
            return null;
        sessions.push({ id: s.id, title: s.title, startsAt: s.startsAt, version: s.version, registered: s.registered, capacity: s.capacity, courseRoster: s.courseRoster });
    }
    for (const t of v.trials) {
        if (!object(t) || !id(t.id) || !['reserved', 'attended', 'no_show', 'cancelled', 'converted'].includes(String(t.state))
            || !integer(t.version) || !object(t.member) || !id(t.member.id) || !text(t.member.name) || !object(t.session)
            || !id(t.session.id) || !text(t.session.title) || !timestamp(t.session.startsAt)
            || (t.session.canRecordOutcome !== undefined && typeof t.session.canRecordOutcome !== 'boolean'))
            return null;
        trials.push({ id: t.id, state: t.state, version: t.version,
            member: { id: t.member.id, name: t.member.name }, session: { id: t.session.id, title: t.session.title, startsAt: t.session.startsAt, canRecordOutcome: t.session.canRecordOutcome === undefined ? null : t.session.canRecordOutcome } });
    }
    if (!unique(students) || !unique(sessions) || !unique(trials))
        return null;
    if (v.stageAutomations !== undefined && (!Array.isArray(v.stageAutomations) || !v.stageAutomations.every(text)))
        return null;
    return { lead: { id: leadId, name: v.lead.name, version: v.lead.version, stage: v.lead.stage, contact: v.lead.contact },
        students, sessions, trials, stageAutomations: v.stageAutomations === undefined ? null : [...v.stageAutomations] };
}
