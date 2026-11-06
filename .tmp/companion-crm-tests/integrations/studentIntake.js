"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntakeContext = getIntakeContext;
exports.previewStudent = previewStudent;
const studentIntake_1 = require("@/domain/studentIntake");
async function read(operation, payload, parse, signal) {
    try {
        const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', signal, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation, payload, requestKey: null }) });
        const value = await response.json();
        if (!response.ok) {
            const e = value && typeof value === 'object' && 'error' in value ? value.error : null;
            return { outcome: 'unavailable', code: e && typeof e === 'object' && 'code' in e && typeof e.code === 'string' ? e.code : 'BACKEND_UNAVAILABLE' };
        }
        const parsed = parse(value);
        return parsed ? { outcome: 'loaded', value: parsed } : { outcome: 'unavailable', code: 'HUB_RESPONSE_UNREADABLE' };
    }
    catch {
        return { outcome: 'unavailable', code: 'BACKEND_UNAVAILABLE' };
    }
}
function getIntakeContext(query, signal) {
    const payload = { query: query.trim() };
    return (0, studentIntake_1.isIntakeContextPayload)(payload) ? read('intake_context', payload, studentIntake_1.intakeContextFrom, signal) : Promise.resolve({ outcome: 'unavailable', code: 'INVALID_COMMAND' });
}
function previewStudent(intake) {
    const payload = { intake };
    return (0, studentIntake_1.isIntakePreviewPayload)(payload) ? read('intake_preview', payload, studentIntake_1.intakePreviewFrom) : Promise.resolve({ outcome: 'unavailable', code: 'INTAKE_FIELDS_REQUIRED' });
}
