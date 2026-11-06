"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROSTER_LIMIT = void 0;
exports.countText = countText;
exports.isToday = isToday;
exports.remainingToday = remainingToday;
exports.classCounts = classCounts;
exports.coverageOf = coverageOf;
exports.messageWork = messageWork;
exports.deliveryProblems = deliveryProblems;
exports.dueFollowUps = dueFollowUps;
exports.leadsNeedingNextAction = leadsNeedingNextAction;
exports.decisionCount = decisionCount;
const arrivals_1 = require("./arrivals");
const followUp_1 = require("./followUp");
const inboxCompanion_1 = require("@/views/inbox/inboxCompanion");
// Rosters are read for this many of today's classes at most (as on Front Desk)
exports.ROSTER_LIMIT = 12;
// The Hub's context read sends at most this many messages (service.py _context)
const MESSAGE_LIMIT = 50;
// "4", or "at least 4" when the source sent only part of the list
function countText(count, partial) {
    return partial ? `at least ${count}` : String(count);
}
// Starts today in the viewer's own time zone (staff are at the school), as on Front Desk
function isToday(iso) {
    if (!iso)
        return false;
    return new Date(iso).toDateString() === new Date().toDateString();
}
// Today's classes that haven't ended, soonest first (context sends them in that order)
function remainingToday(context) {
    return context.sessions.filter((session) => isToday(session.startsAt));
}
// One class's roster in numbers: booked, here (present or late) and not arrived
// (booked, nothing recorded yet). Other recorded states (absent, excused…) are
// in booked only.
function classCounts(roster) {
    const members = roster.members;
    return {
        booked: members.length,
        here: members.filter((member) => arrivals_1.ARRIVED_STATES.includes(member.attendance)).length,
        notArrived: members.filter((member) => arrivals_1.EXPECTED_STATES.includes(member.attendance)).length,
    };
}
// Instructor coverage: today's classes whose roster says no instructor is
// assigned in Odoo. Classes whose roster wasn't read (or couldn't be) are
// counted apart, never as covered.
function coverageOf(sessions, rosters) {
    const gaps = [];
    let unchecked = 0;
    sessions.forEach((session, index) => {
        const roster = index < exports.ROSTER_LIMIT ? rosters[session.id] : null;
        if (!roster)
            unchecked += 1;
        else if (roster.session.instructor === null)
            gaps.push({ session, roster });
    });
    return { gaps, unchecked };
}
// Messages still waiting for staff (no reply approved yet), by their Hub state,
// with the Inbox's own rule (needsStaff)
function messageWork(context) {
    const counts = { unmatched: 0, received: 0, resolved: 0 };
    for (const message of context.messages) {
        if ((0, inboxCompanion_1.needsStaff)(context, message))
            counts[message.state] += 1;
    }
    const total = counts.unmatched + counts.received + counts.resolved;
    return { counts, total, partial: context.messages.length >= MESSAGE_LIMIT };
}
// Approved replies the provider reported failed, or that may or may not have
// been sent. The Hub never retries an uncertain one by itself.
function deliveryProblems(context) {
    const problems = [];
    for (const message of context.messages) {
        const delivery = (0, inboxCompanion_1.deliveryOf)(context, message.id);
        if (delivery && (delivery.state === "failed" || delivery.state === "uncertain" || delivery.state === "cancelled")) {
            problems.push({ delivery, message });
        }
    }
    return { problems, partial: context.messages.length >= MESSAGE_LIMIT };
}
// Overdue CRM tasks, then those due today, in the Follow-ups page's order.
// null when this read has no tasks DreamOS can use.
function dueFollowUps(crm) {
    const read = crm.followUps;
    if (read.outcome !== "loaded")
        return null;
    const inState = (state) => read.tasks
        .filter((task) => task.state === state)
        .sort((a, b) => (0, followUp_1.compareFollowUps)(a, b, crm.leads));
    const overdue = inState("overdue");
    const today = inState("today");
    return { tasks: [...overdue, ...today], overdue: overdue.length, today: today.length, partial: read.moreTasks };
}
// Leads with no open task whose recorded evidence asks for one (Follow-ups'
// "Needs a next action"), from the latest leads this read sent
function leadsNeedingNextAction(crm) {
    return { leads: (0, followUp_1.leadsWithoutNextAction)(crm.leads), partial: crm.moreLeads };
}
// How many things need a decision, from the parts that loaded. Partial when a
// source hit its limit or a class's roster couldn't be checked.
function decisionCount(work) {
    let count = 0;
    let partial = work.coverage === null || work.messages === null || work.deliveries === null || (work.crmExpected === true && (work.due === null || work.noNextAction === null));
    if (work.coverage) {
        count += work.coverage.gaps.length;
        partial ||= work.coverage.unchecked > 0;
    }
    if (work.deliveries) {
        count += work.deliveries.problems.length;
        partial ||= work.deliveries.partial;
    }
    if (work.messages) {
        count += work.messages.total;
        partial ||= work.messages.partial;
    }
    if (work.due) {
        count += work.due.tasks.length;
        partial ||= work.due.partial;
    }
    if (work.noNextAction) {
        count += work.noNextAction.leads.length;
        partial ||= work.noNextAction.partial;
    }
    return { count, partial };
}
