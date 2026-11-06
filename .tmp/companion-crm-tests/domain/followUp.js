"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEXT_ACTION_LABELS = exports.FOLLOW_UP_GROUPS = void 0;
exports.leadOf = leadOf;
exports.compareFollowUps = compareFollowUps;
exports.leadsWithoutNextAction = leadsWithoutNextAction;
exports.recordHref = recordHref;
// The queue's groups, in order. "done" only shows if Odoo ever sends one.
exports.FOLLOW_UP_GROUPS = [
    { state: "overdue", title: "Overdue", empty: "Nothing overdue." },
    { state: "today", title: "Due today", empty: "Nothing due today." },
    { state: "planned", title: "Upcoming", empty: "Nothing planned." },
    { state: "done", title: "Done", empty: "" },
];
// The lead evidence's next action, as staff read it. These are the kinds the
// Hub's prepare_lead_action takes, so each can become "Prepare …" later.
exports.NEXT_ACTION_LABELS = {
    follow_up: "Follow up",
    trial: "Offer a trial",
    reactivation: "Reactivate",
    conversion: "Convert to member",
};
const PRIORITY_ORDER = { Now: 0, High: 1, Normal: 2, Low: 3 };
// The lead a lead task belongs to, when it's among the leads this read sent
// (crm_context sends the latest 100 leads but tasks for every lead)
function leadOf(task, leads) {
    if (task.relatedType !== "lead")
        return null;
    return leads.find((lead) => lead.id === task.relatedId) ?? null;
}
// Within a group: soonest due first (no due date last), then the lead's
// recorded priority, then Odoo's id
function compareFollowUps(a, b, leads) {
    if (a.due !== b.due) {
        if (a.due === null)
            return 1;
        if (b.due === null)
            return -1;
        return a.due < b.due ? -1 : 1;
    }
    const aPriority = leadOf(a, leads)?.evidence?.priority;
    const bPriority = leadOf(b, leads)?.evidence?.priority;
    const aRank = aPriority ? PRIORITY_ORDER[aPriority] : 4;
    const bRank = bPriority ? PRIORITY_ORDER[bPriority] : 4;
    if (aRank !== bRank)
        return aRank - bRank;
    return Number(a.id) - Number(b.id) || (a.id < b.id ? -1 : 1);
}
// Leads with no open task whose evidence asks for one (High or Now). Won, Lost
// and Nurture leads don't, by the evidence's own rules (crm.py _lead_evidence).
function leadsWithoutNextAction(leads) {
    return leads.filter((lead) => !lead.lostReason &&
        lead.evidence &&
        lead.evidence.openTasks === 0 &&
        (lead.evidence.priority === "Now" || lead.evidence.priority === "High"));
}
// Where to handle it: the lead's record or the member's Member 360
function recordHref(task) {
    return task.relatedType === "lead" ? `/crm/leads/${task.relatedId}` : `/people/${task.relatedId}`;
}
