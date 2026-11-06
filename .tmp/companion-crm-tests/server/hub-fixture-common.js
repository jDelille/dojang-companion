"use strict";
// DEVELOPMENT-ONLY helpers shared by the Hub fixtures (crm-fixture.ts,
// inbox-fixture.ts). Ported from Jodi's dojo_companion_hub service.py.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRevision = exports.isRecordId = exports.fail = void 0;
exports.fingerprint = fingerprint;
exports.cleanText = cleanText;
exports.hasExactKeys = hasExactKeys;
// HubProblem(code, status=409)
const fail = (code, status = 409) => ({
    status,
    body: { error: { code, status } },
});
exports.fail = fail;
// The request's fingerprint, with keys in a fixed order (the Hub's fingerprint())
function fingerprint(value) {
    if (Array.isArray(value))
        return `[${value.map(fingerprint).join(",")}]`;
    if (value && typeof value === "object") {
        const entries = Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1));
        return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${fingerprint(item)}`).join(",")}}`;
    }
    return JSON.stringify(value);
}
// dojo_kiosk record_id(): an Odoo record id as a string
const isRecordId = (value) => typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);
exports.isRecordId = isRecordId;
// text(): 1..maximum characters after trimming, or null
function cleanText(value, maximum) {
    if (typeof value !== "string")
        return null;
    const trimmed = value.trim();
    return trimmed.length >= 1 && trimmed.length <= maximum ? trimmed : null;
}
// exact(payload, "a b c"): an object with exactly these keys
function hasExactKeys(value, keys) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
    return Object.keys(value).sort().join() === [...keys].sort().join();
}
const isRevision = (value) => typeof value === "number" && Number.isInteger(value);
exports.isRevision = isRevision;
