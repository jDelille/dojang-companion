"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPLETION_OPERATIONS = void 0;
exports.completionPayloadAllowed = completionPayloadAllowed;
exports.completionResultAllowed = completionResultAllowed;
exports.onboardingFrom = onboardingFrom;
exports.ledgerFrom = ledgerFrom;
// Existing onboarding/refund/testing contracts from Companion's Hub adapters.
exports.COMPLETION_OPERATIONS = ['request_refund', 'approve_refund', 'record_refund_payment', 'cancel_refund', 'save_testing_roster', 'record_test_results', 'promote_test_results', 'reverse_promotion'];
const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v) => typeof v === 'string' && /^[1-9][0-9]{0,9}$/.test(v) && Number(v) <= 2147483647;
const ver = (v) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const str = (v) => typeof v === 'string';
const text = (v, max = 500) => str(v) && !!v.trim() && v.length <= max;
const keys = (v, k) => Object.keys(v).sort().join() === k.split(' ').sort().join();
const token = (v) => str(v) && /^[a-f0-9]{64}$/.test(v);
const day = (v) => str(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const amount = (v) => typeof v === 'number' && Number.isFinite(v);
const nullable = (v) => v === null || str(v);
const nativeOptional = (v) => v === false || nullable(v);
const oneId = (v) => Array.isArray(v) && v.length === 1 && id(v[0]);
function completionPayloadAllowed(operation, p) {
    if (!text(p.reason))
        return false;
    switch (operation) {
        case 'request_refund': return keys(p, 'memberId invoiceId reason reviewToken') && id(p.memberId) && id(p.invoiceId) && token(p.reviewToken);
        case 'approve_refund':
        case 'record_refund_payment':
        case 'cancel_refund': return keys(p, 'refundId expectedVersion reason') && id(p.refundId) && ver(p.expectedVersion);
        case 'save_testing_roster': return keys(p, 'testId expectedVersion name testDate add removeRegistrationIds reason') && (p.testId === null || id(p.testId)) && ver(p.expectedVersion) && text(p.name, 200) && day(p.testDate)
            && Array.isArray(p.add) && Array.isArray(p.removeRegistrationIds) && p.add.length + p.removeRegistrationIds.length === 1
            && p.add.every(r => obj(r) && keys(r, 'memberId targetRankId') && id(r.memberId) && id(r.targetRankId)) && p.removeRegistrationIds.every(id)
            && (p.testId !== null || (p.expectedVersion === 0 && p.removeRegistrationIds.length === 0));
        case 'record_test_results': return keys(p, 'testId expectedVersion results reason') && id(p.testId) && ver(p.expectedVersion) && Array.isArray(p.results) && p.results.length === 1 && p.results.every(r => obj(r) && keys(r, 'registrationId result') && id(r.registrationId) && str(r.result) && ['pending', 'pass', 'fail', 'withdrew'].includes(r.result));
        case 'promote_test_results': return keys(p, 'testId expectedVersion registrationIds reason reviewToken') && id(p.testId) && ver(p.expectedVersion) && oneId(p.registrationIds) && token(p.reviewToken);
        case 'reverse_promotion': return keys(p, 'rankHistoryId expectedVersion reason') && id(p.rankHistoryId) && ver(p.expectedVersion);
        default: return false;
    }
}
function completionResultAllowed(operation, p, v, subjectId) {
    if (typeof v.replayed !== 'boolean' || (subjectId !== undefined && !id(subjectId)))
        return false;
    if (operation.includes('refund')) {
        if (!id(v.memberId) || !id(v.refundId))
            return false;
        // A shared household invoice can expose a refund originally requested from
        // another student's profile. Subsequent steps bind to that exact refund ID,
        // not to the profile used to open the linked invoice.
        if (operation === 'request_refund')
            return v.memberId === p.memberId && (subjectId === undefined || v.memberId === subjectId) && v.state === 'refund_requested' && v.moneyReturned === false && v.creditNotePosted === false && amount(v.amount) && v.amount > 0 && text(v.currency, 32);
        if (v.refundId !== p.refundId || !ver(v.version))
            return false;
        if (operation === 'approve_refund')
            return v.state === 'refund_approved' && v.moneyReturned === false && v.creditNotePosted === true && text(v.creditNote, 200) && str(v.next) && ['awaiting_provider_refund', 'awaiting_refund_payment', 'refunded_by_provider'].includes(v.next);
        if (operation === 'record_refund_payment')
            return v.state === 'refund_payment_recorded' && v.moneyReturned === true && v.evidence === 'staff_recorded' && text(v.payment, 200) && text(v.journal, 200);
        return operation === 'cancel_refund' && v.state === 'refund_cancelled' && v.moneyReturned === false;
    }
    if (operation === 'reverse_promotion')
        return v.memberId !== undefined && id(v.memberId) && (subjectId === undefined || v.memberId === subjectId) && v.rankHistoryId === p.rankHistoryId && v.state === 'promotion_reversed' && v.reason === p.reason && ver(v.version);
    if (!id(v.testId) || (p.testId !== null && v.testId !== p.testId) || !ver(v.version) || v.reason !== p.reason)
        return false;
    if (operation === 'save_testing_roster')
        return v.state === 'testing_roster_saved' && Array.isArray(v.added) && v.added.every(id) && Array.isArray(v.removedMembers) && v.removedMembers.every(id) && ver(v.count)
            && v.added.length === p.add.length && v.removedMembers.length === p.removeRegistrationIds.length && (subjectId === undefined || v.removedMembers.length === 0 || v.removedMembers[0] === subjectId);
    if (operation === 'record_test_results') {
        const expected = p.results[0];
        return v.state === 'test_results_saved' && Array.isArray(v.changes) && v.changes.length === 1 && obj(v.changes[0]) && v.changes[0].registrationId === expected.registrationId && v.changes[0].after === expected.result && str(v.changes[0].before);
    }
    return operation === 'promote_test_results' && v.state === 'promotions_awarded' && v.messageSent === false && v.invoiceCreated === false && Array.isArray(v.promotions) && v.promotions.length === 1 && v.promotions.every(r => obj(r) && id(r.rankHistoryId) && id(r.memberId) && str(r.rank) && (subjectId === undefined || r.memberId === subjectId));
}
function onboardingFrom(v, memberId) {
    if (!obj(v) || v.memberId !== memberId || !ver(v.done) || !ver(v.total) || !Array.isArray(v.items) || v.items.length > 100)
        return null;
    const items = [];
    for (const r of v.items) {
        if (!obj(r) || !str(r.key) || !str(r.label) || typeof r.done !== 'boolean' || !str(r.detail) || !str(r.where))
            return null;
        items.push({ key: r.key, label: r.label, done: r.done, detail: r.detail, where: r.where });
    }
    return new Set(items.map(r => r.key)).size === items.length && items.length === v.total && items.filter(r => r.done).length === v.done ? { memberId, done: v.done, total: v.total, items } : null;
}
function ledgerFrom(v, memberId) {
    if (!obj(v) || v.memberId !== memberId || typeof v.canApprove !== 'boolean' || !Array.isArray(v.invoices) || v.invoices.length > 50)
        return null;
    const invoices = [];
    for (const i of v.invoices) {
        if (!obj(i) || !id(i.id) || !str(i.number) || !(i.date === null || day(i.date)) || !amount(i.total) || !amount(i.remaining) || !str(i.currency) || !str(i.paymentState) || typeof i.settled !== 'boolean' || !Array.isArray(i.settlementEvidence) || !i.settlementEvidence.every(e => e === 'provider_receipt' || e === 'staff_recorded') || !Array.isArray(i.payments) || !Array.isArray(i.refunds) || typeof i.refundable !== 'boolean' || !ver(i.version))
            return null;
        const payments = [], refunds = [];
        for (const p of i.payments) {
            if (!obj(p) || !id(p.id) || !amount(p.amount) || !day(p.date) || !str(p.journal) || !str(p.evidence) || !['provider_receipt', 'staff_recorded'].includes(p.evidence) || !nativeOptional(p.provider) || !nativeOptional(p.providerReference) || !nativeOptional(p.transactionState))
                return null;
            payments.push({ id: p.id, amount: p.amount, date: p.date, journal: p.journal, evidence: p.evidence, provider: p.provider || null, providerReference: p.providerReference || null, transactionState: p.transactionState || null });
        }
        for (const r of i.refunds) {
            if (!obj(r) || !id(r.id) || r.invoiceId !== i.id || !amount(r.amount) || !str(r.currency) || !str(r.method) || !['manual', 'provider'].includes(r.method) || !str(r.state) || !['awaiting_approval', 'awaiting_refund_payment', 'awaiting_provider_refund', 'refunded_by_provider', 'refunded', 'cancelled'].includes(r.state) || !nullable(r.creditNote) || !str(r.requestedBy) || !nullable(r.approvedBy) || !nullable(r.refundPayment) || !ver(r.version))
                return null;
            refunds.push({ id: r.id, invoiceId: i.id, amount: r.amount, currency: r.currency, method: r.method, state: r.state, creditNote: r.creditNote, requestedBy: r.requestedBy, approvedBy: r.approvedBy, refundPayment: r.refundPayment, version: r.version });
        }
        if (new Set(refunds.map(r => r.id)).size !== refunds.length || new Set(payments.map(p => p.id)).size !== payments.length)
            return null;
        invoices.push({ id: i.id, number: i.number, date: i.date, total: i.total, remaining: i.remaining, currency: i.currency, paymentState: i.paymentState, settled: i.settled, settlementEvidence: i.settlementEvidence, payments, refunds, refundable: i.refundable, version: i.version });
    }
    return new Set(invoices.map(i => i.id)).size === invoices.length ? { memberId, canApprove: v.canApprove, invoices } : null;
}
