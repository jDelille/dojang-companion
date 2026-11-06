"use strict";
// The Hub action contract, for the one write DreamOS uses so far.
//
// Request (same body as Companion's POST /api/hub, which forwards to Odoo's
// POST /companion/hub/action as the signed-in staff member):
//   { operation: "prepare_lead_action", payload: PrepareLeadActionPayload, requestKey }
//
// Shapes copied from Jodi's dojo_companion_hub (16 Oct 2026): service.py _dispatch
// (request keys, replay, errors) and crm.py _prepare_lead_action.
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRequestKey = exports.isRequestKey = void 0;
exports.explainHubError = explainHubError;
// Odoo's KEY (dojo_kiosk_v2.py): the same key + same request replays the saved
// result; the same key with a different request is IDEMPOTENCY_CONFLICT
const REQUEST_KEY = /^[A-Za-z0-9][A-Za-z0-9_.:-]{15,127}$/;
const isRequestKey = (value) => typeof value === "string" && REQUEST_KEY.test(value);
exports.isRequestKey = isRequestKey;
// Made once per attempt. A retry after an unconfirmed result reuses it.
const newRequestKey = () => `dfm-${crypto.randomUUID()}`;
exports.newRequestKey = newRequestKey;
// Staff-facing text for the codes these actions can return (Companion's explainHubError copy)
const MESSAGES = {
    GUARDIAN_REVIEW_REQUIRED: "A manager must verify this sender's guardian authority before continuing.",
    NOT_ON_ROSTER: "This student is not registered for that class. Book them first or review the roster.",
    CLASS_REVIEW_REQUIRED: "Confirm the student and class first.",
    ALREADY_APPROVED: "A reply for this message was already approved.",
    PROVIDER_NOT_CONFIGURED: "Messaging is not configured. Your draft remains saved.",
    MESSAGE_UNAVAILABLE: "This message is unavailable with your current access.",
    MEMBER_UNAVAILABLE: "This student is unavailable with your current access.",
    SESSION_UNAVAILABLE: "This class is unavailable with your current access.",
    REPORT_TOO_LARGE: "This class has more bookings than Odoo will list at once (500).",
    BACKEND_UNAVAILABLE: "Odoo isn't reachable right now.",
    VERSION_CONFLICT: "This record changed since you opened it. Reload it and review again.",
    SHARED_CONTACT_REVIEW_REQUIRED: "This record uses a shared contact. Review contact changes in Odoo; they cannot be saved from this form.",
    IDEMPOTENCY_CONFLICT: "This request was already used for a different change. Start the review again.",
    LEAD_UNAVAILABLE: "This lead is unavailable with your current access.",
    TASK_UNAVAILABLE: "This task is unavailable within your current access. Refresh the task queue.",
    AUTOMATED_TASK_REVIEW_REQUIRED: "This task belongs to an automation or cannot be completed manually. Review it in Odoo.",
    INVALID_COMMAND: "This action is unavailable or its fields are invalid.",
    FORBIDDEN: "You don't have access to do this.",
    REQUEST_ORIGIN_REJECTED: "This app rejected the request before contacting Odoo because the browser address does not match the configured app origin. Open the configured app address or have its origin setting corrected.",
    ODOO_ASSIGNMENT_FORBIDDEN: "Odoo refused this owner assignment. The assignee list was readable, but the save was denied. This may be a staff/site permission check, a changed assignee grant, or an Odoo access rule. Reload the record and assignee list before trying again; an unassigned current owner is allowed.",
    TRIAL_ALREADY_OPEN: 'This lead or student already has an open trial. Refresh the trial records before proceeding.',
    TRIAL_UNAVAILABLE: 'This trial is unavailable with your current access.',
    TRIAL_REVIEW_REQUIRED: 'The trial or its class registration is no longer eligible for this action. Refresh the trial records.',
    ATTENDANCE_WINDOW_CLOSED: 'Attendance is outside the permitted time window: from 15 minutes before class until 31 days after it ends.',
    ATTENDANCE_REVIEW_REQUIRED: 'Attendance already exists for this student and class. Review the existing attendance in Odoo; no duplicate is recorded.',
    TRIAL_STUDENT_REVIEW_REQUIRED: 'The selected student is not in lead or trial status. Review the record in Odoo.',
    INTAKE_FIELDS_REQUIRED: 'Complete the student details, contact information, guardian selection where needed, and identity review reference.',
    INTAKE_REVIEW_CHANGED: 'The reviewed intake changed. Review the student details again before confirming.',
    DUPLICATE_STUDENT_REVIEW_REQUIRED: 'A matching student already exists. Review the existing profile instead of creating another.',
    GUARDIAN_DUPLICATE_REVIEW_REQUIRED: 'A matching guardian contact exists. Select the verified existing household or ask an administrator to review it.',
    GUARDIAN_UNAVAILABLE: 'The selected guardian or household is unavailable or changed. Search and review the selection again.',
    ENROLLMENT_REVIEW_REQUIRED: 'An existing class registration needs staff review. No new trial was confirmed.',
    HUB_RESPONSE_UNREADABLE: 'Odoo returned data this app cannot validate. No successful result was inferred.',
    BUSINESS_RULE_REVIEW_REQUIRED: "Odoo could not approve this change.",
    CONCURRENT_RETRY: "Someone else is changing this record. Retry the same request in a moment.",
    NO_CHANGES: 'No changed fields were entered.',
    NOT_CHECKED_IN: 'No existing check-in was found for this student and class.',
    RETRY_AFTER_CHECKIN: 'Checkout must be later than check-in. Wait a moment, reload, and review again.',
    SESSION_NOT_OPEN: 'This class is not open for booking or has already started.',
    INVALID_RANK: 'Choose an available rank and a stripe count within its configured limit.',
    PHOTO_TYPE_UNSUPPORTED: 'Choose a JPEG, PNG or WebP photo no larger than 15 MB.',
    PHOTO_TOO_LARGE: 'The photo exceeds the supported size. Choose a smaller image.',
    PHOTO_DIMENSIONS: 'The photo must be at least 64 pixels on each side.',
    PHOTO_INVALID: 'The photo could not be decoded or validated.',
    PAYMENT_SETUP_REQUIRED: 'Odoo portal payments are not enabled for this school.',
    PAYMENT_PROVIDER_UNAVAILABLE: 'Odoo has no available published payment provider for this invoice.',
    PAYMENT_URL_NOT_CONFIGURED: 'Odoo did not provide a checkout URL on the approved secure Odoo origin.',
    PAYMENT_PENDING_OR_SETTLED: 'This invoice is already settled or has a payment in progress.',
    INVOICE_NOT_PAYABLE: 'This billing record is not a payable posted invoice with a remaining amount.',
    INVOICE_UNAVAILABLE: 'This invoice is not available through the selected student’s linked subscriptions.',
    ATTENDANCE_UNCHANGED: 'This attendance status is already recorded.',
    CORRECTION_REQUIRES_MANAGER: 'An owner or manager must review an existing attendance correction.',
    REVERSAL_REQUIRES_MANAGER: 'An owner or manager must review changing attended to a non-attended state.',
    CAPACITY_REVIEW_REQUIRED: 'The reviewed course assignment would exceed class capacity, or its plan is unavailable. Reload and review in Odoo.',
    ARCHIVE_REVIEW_REQUIRED: 'The archive impact review is unavailable or has blockers. Reload the record and review in Odoo.',
    GUARDIAN_NOT_IN_HOUSEHOLD: 'The selected guardian is not linked to this student’s household.',
    GUARDIAN_PHONE_REQUIRED: 'The guardian needs a phone number before a kiosk PIN can be set.',
    GUARDIAN_PIN_TOO_SIMPLE: 'Choose a less predictable six-digit PIN.',
    GUARDIAN_PIN_NOT_SET: 'No active kiosk PIN was found for this guardian.',
    SIGNATURE_EMPTY: 'The actual signer must draw a signature before review.',
    SIGNATURE_INVALID: 'The signature image is invalid or outside the supported dimensions.',
    SIGNATURE_AGREEMENT_REQUIRED: 'The signer must agree to the current waiver text.',
    SIGNER_NOT_AUTHORIZED: 'Odoo did not authorize this person to sign for the selected student.',
    WAIVER_TEXT_CHANGED: 'The waiver text changed. Reload it and obtain a signature against the current version.',
    WAIVER_ALREADY_SIGNED: 'This student’s waiver is already signed.',
    CONSENT_UNCHANGED: 'This consent state is already recorded.',
    CONTACT_ADDRESS_REQUIRED: 'The selected contact has no address for this communication channel.',
    REFUND_NOT_SETTLED: 'The invoice is no longer settled or eligible for this full-refund workflow. Refresh the ledger.',
    REFUND_ALREADY_OPEN: 'A refund request or completed refund already exists for this invoice. Refresh the ledger.',
    REFUND_ALREADY_CREDITED: 'This invoice already has a non-cancelled credit note. Review the existing accounting records.',
    REFUND_REVIEW_CHANGED: 'The refund evidence changed. Refresh the ledger and obtain a new refund preview.',
    REFUND_UNAVAILABLE: 'This refund is unavailable in the current site scope.',
    REFUND_NOT_PENDING: 'The refund is no longer awaiting approval. Refresh its current state.',
    REFUND_PAYMENT_NOT_ALLOWED: 'Odoo cannot record a desk refund payment in this state or for this refund method.',
    REFUND_JOURNAL_REQUIRED: 'An appropriate cash or bank journal is required before recording the refund payment.',
    TEST_UNAVAILABLE: 'This test is unavailable in the current school scope.',
    TEST_NOT_EDITABLE: 'This test is no longer editable for the requested step. Refresh the testing records.',
    ROSTER_DUPLICATE: 'This student is already on the selected testing roster.',
    ROSTER_CHANGED: 'The testing registration changed. Reload the test roster before reviewing again.',
    TARGET_RANK_NOT_HIGHER: 'The target rank must be higher than the student’s current rank.',
    PROMOTED_RESULT_LOCKED: 'The result is linked to an existing promotion and cannot be changed through this step.',
    RESULTS_UNCHANGED: 'The selected testing result is already recorded.',
    PROMOTION_REVIEW_REQUIRED: 'Odoo could not approve the selected promotion. Review the result, rank and current registration.',
    PROMOTION_REVIEW_CHANGED: 'The promotion plan changed. Obtain a new promotion preview before confirming.',
    PROMOTION_UNAVAILABLE: 'This active rank award is unavailable in the current school scope.',
    REVERSAL_NOT_LATEST: 'Only the latest active award can be reversed. Refresh the award history.',
    // From the server's Hub connection (src/server/hub-gateway.ts), as in Companion
    BACKEND_UNAVAILABLE_RETRY_SAME_ACTION: "Odoo isn't reachable right now.",
    HUB_NOT_CONFIGURED: "The Odoo connection isn't configured on this server.",
    SIGN_IN_REQUIRED: "Sign in with your Odoo staff account.",
    UNAUTHENTICATED: "Sign in with your Odoo staff account.",
    SIGN_IN_FAILED_OR_MFA_REQUIRED: "Sign-in failed. Check the login and password. Accounts that need two-factor sign-in can't sign in here yet.",
    NO_SITE_ACCESS: "This Odoo account has no Companion access for this site.",
    // The server's allowlist refused it (src/server/hub-gateway.ts): not a change DreamOS makes yet
    HUB_READ_ONLY: "DreamOS can't make this change in Odoo yet. Nothing was changed.",
};
function explainHubError(code) {
    return MESSAGES[code] ?? code.replaceAll("_", " ").toLowerCase();
}
