"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberRecordsFrom = memberRecordsFrom;
exports.sectionUnavailable = sectionUnavailable;
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const text = (v) => typeof v === 'string';
const integer = (v) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const day = (v) => text(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const optionalDay = (v) => v === null || day(v);
function rows(value, limit, maximum, parse) {
    if (value === undefined)
        return { outcome: 'unavailable', reason: 'unsupported' };
    if (!Array.isArray(value) || value.length > maximum)
        return { outcome: 'unavailable', reason: 'unreadable' };
    const result = [];
    for (const row of value) {
        const parsed = parse(row);
        if (!parsed)
            return { outcome: 'unavailable', reason: 'unreadable' };
        result.push(parsed);
    }
    if (new Set(result.map(r => r.id)).size !== result.length)
        return { outcome: 'unavailable', reason: 'unreadable' };
    return { outcome: 'loaded', rows: result, capped: limit === null || result.length >= limit };
}
function memberRecordsFrom(details) {
    const historyLimit = obj(details.limits) && integer(details.limits.rankHistory) && details.limits.rankHistory > 0 ? details.limits.rankHistory : null;
    const rankHistory = rows(details.rankHistory, historyLimit, 20, (v) => obj(v) && id(v.id) && text(v.rank) && integer(v.stripes) && day(v.date) ? { id: v.id, rank: v.rank, stripes: v.stripes, date: v.date } : null);
    const restricted = { outcome: 'unavailable', reason: details.canEdit === false ? 'restricted' : 'unsupported' };
    // Odoo returns [] for courses and null for billing to non-management roles.
    // Those are not evidence of no courses or no billing records.
    if (details.canEdit !== true)
        return { rankHistory, courses: restricted, subscriptions: restricted, invoices: restricted };
    const courses = rows(details.courses, 50, 50, (v) => obj(v) && id(v.id) && text(v.name) ? { id: v.id, name: v.name } : null);
    const billing = details.billing;
    if (billing === undefined || billing === null)
        return { rankHistory, courses, subscriptions: { outcome: 'unavailable', reason: 'unsupported' }, invoices: { outcome: 'unavailable', reason: 'unsupported' } };
    if (!obj(billing) || !integer(billing.limit) || billing.limit < 1 || billing.limit > 50)
        return { rankHistory, courses, subscriptions: { outcome: 'unavailable', reason: 'unreadable' }, invoices: { outcome: 'unavailable', reason: 'unreadable' } };
    const subscriptions = rows(billing.subscriptions, billing.limit, 50, (v) => obj(v) && id(v.id) && text(v.plan) && text(v.state) && optionalDay(v.nextInvoiceDate) ? { id: v.id, plan: v.plan, state: v.state, nextInvoiceDate: v.nextInvoiceDate } : null);
    const invoices = rows(billing.invoices, billing.limit, 50, (v) => obj(v) && id(v.id) && text(v.number) && (v.kind === 'out_invoice' || v.kind === 'out_refund') && optionalDay(v.date)
        && text(v.paymentState) && finite(v.total) && finite(v.remaining) && text(v.currency) && !!v.currency.trim() && (v.scope === 'member' || v.scope === 'household')
        ? { id: v.id, number: v.number, kind: v.kind, date: v.date, paymentState: v.paymentState, total: v.total, remaining: v.remaining, currency: v.currency, scope: v.scope } : null);
    return { rankHistory, courses, subscriptions, invoices };
}
function sectionUnavailable(reason) {
    return reason === 'restricted' ? 'Not visible with your current role.' : reason === 'unreadable' ? 'Unavailable: the returned data could not be validated.' : 'Not provided by this read.';
}
