"use strict";
// What the shared Do For Me rail shows for the record or surface staff are on.
// Ported from Companion 1cab554b src/domain/companion.ts (only the read-only
// parts: no requests or approvals yet). The focus kinds follow Companion's
// viewFromPath (front desk / member / session), with the Sales and lead focus added.
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusKey = focusKey;
// "people", "member:5001", "sales", "lead:9005", "inbox", "message:4001". The rail
// remembers its tab and picked task per key, so coming back to a record finds
// it as it was left.
function focusKey(focus) {
    if (focus.kind === "member")
        return `member:${focus.memberId}`;
    if (focus.kind === "lead")
        return `lead:${focus.leadId}`;
    if (focus.kind === "message")
        return `message:${focus.messageId}`;
    return focus.kind;
}
