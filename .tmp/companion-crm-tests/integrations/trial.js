"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrialContext = getTrialContext;
const trial_1 = require("@/domain/trial");
const hubAction_1 = require("@/domain/hubAction");
async function getTrialContext(leadId, query, signal) {
    const unavailable = (code) => ({ outcome: 'unavailable', code, text: (0, hubAction_1.explainHubError)(code) });
    const payload = { leadId, query: query.trim() };
    if (!(0, trial_1.isTrialContextPayload)(payload))
        return unavailable('INVALID_COMMAND');
    try {
        const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', signal,
            headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation: 'trial_context', payload, requestKey: null }) });
        const value = await response.json();
        if (!response.ok) {
            const error = value && typeof value === 'object' && 'error' in value ? value.error : null;
            return unavailable(error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : 'BACKEND_UNAVAILABLE');
        }
        const context = (0, trial_1.trialContextFrom)(value, leadId);
        return context ? { outcome: 'loaded', context } : unavailable('HUB_RESPONSE_UNREADABLE');
    }
    catch {
        return unavailable('BACKEND_UNAVAILABLE');
    }
}
