"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USES_SAMPLE_MEMBERS = void 0;
exports.getMembers = getMembers;
exports.getMemberRecord = getMemberRecord;
const react_1 = require("react");
const memberRecords_1 = require("@/domain/memberRecords");
const hubAction_1 = require("@/domain/hubAction");
const hub_gateway_1 = require("@/server/hub-gateway");
const member_fixture_1 = require("@/server/member-fixture");
// The only place People and Member 360 get member data from. Runs on the server.
//
//   DOJANG_HUB_ENABLED=true   the real Hub in Odoo, as the signed-in staff member
//                             (src/server/hub-gateway.ts). Read-only. If Odoo or
//                             sign-in fails, the answer says so; never fixture data.
//   otherwise                 the development fixture (src/server/member-fixture.ts),
//                             outside production only.
exports.USES_SAMPLE_MEMBERS = !(0, hub_gateway_1.hubEnabled)() && process.env.NODE_ENV !== "production";
const NOT_CONNECTED = "Member data isn't connected to Odoo yet";
const unavailable = (code) => ({ outcome: "unavailable", code, text: (0, hubAction_1.explainHubError)(code) });
// An answer DreamOS can't read is reported, not guessed around
const UNREADABLE = {
    outcome: "unavailable",
    code: "HUB_RESPONSE_UNREADABLE",
    text: "Odoo sent member data DreamOS can't read.",
};
// ---------------------------------------------------------------------------
// The Hub's shapes (dojo_companion_hub models/service.py)
const MEMBERSHIP_STATES = ["lead", "trial", "active", "paused", "cancelled"];
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string";
const isState = (value) => MEMBERSHIP_STATES.includes(value);
// One entry of context.members: { id, name, version, state, rank }
function memberFromList(entry) {
    if (!isObject(entry) || !isText(entry.id) || !isText(entry.name) || !isState(entry.state) || !isText(entry.rank)) {
        return null;
    }
    return { id: entry.id, name: entry.name, membershipState: entry.state, rank: { name: entry.rank } };
}
// member_details.limits: how many bookings / check-ins the Hub sends at most.
// Without a limit DreamOS can't tell a full list from a cut-off one.
function limitOf(details, name) {
    const limits = details.limits;
    if (!isObject(limits))
        return null;
    const limit = limits[name];
    return typeof limit === "number" && Number.isSafeInteger(limit) && limit > 0 ? limit : null;
}
// member_details.member: { id, name, version, partnerVersion, phone, email,
// dateOfBirth, photo, state, rank, stripes }. Contact fields aren't shown yet.
function memberFromDetails(details) {
    const member = details.member;
    if (!isObject(member) || !isText(member.id) || !isText(member.name) || !isState(member.state) || !isText(member.rank)) {
        return null;
    }
    const stripes = typeof member.stripes === "number" ? member.stripes : undefined;
    const bookings = bookingsFromDetails(details.bookings);
    const bookingsLimit = limitOf(details, "bookings");
    return {
        id: member.id,
        name: member.name,
        ...(typeof member.email === "string" ? { email: member.email } : {}),
        ...(typeof member.phone === "string" ? { phone: member.phone } : {}),
        membershipState: member.state,
        rank: { name: member.rank, stripes },
        records: (0, memberRecords_1.memberRecordsFrom)(details),
        ...(typeof member.photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(member.photo) ? { photo: member.photo } : {}),
        bookings,
        // No known limit: assume the list may be cut off
        bookingsCapped: bookings ? bookingsLimit === null || bookings.length >= bookingsLimit : undefined,
    };
}
// member_details.bookings: registered classes that haven't ended
// { id, sessionId, title, startsAt, attendanceState, replaceable }
// One unreadable entry makes the whole list unknown (undefined), never a
// shorter list or a confirmed 0.
function bookingsFromDetails(value) {
    if (!Array.isArray(value))
        return undefined;
    const bookings = [];
    for (const entry of value) {
        if (!isObject(entry) || !isText(entry.sessionId) || !isText(entry.title) || !isText(entry.startsAt)) {
            return undefined;
        }
        if (!Number.isFinite(Date.parse(entry.startsAt)))
            return undefined;
        bookings.push({ sessionId: entry.sessionId, title: entry.title, startsAt: entry.startsAt });
    }
    return bookings;
}
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// Check-ins in the last 7 days, from a newest-first list that may be cut off at
// its limit. Exact when the list is shorter than the limit, or when it already
// reaches back past the 7 days (then every check-in inside them is in the list).
// Otherwise it's only "at least".
function lastSevenDays(history, limit) {
    const since = Date.now() - SEVEN_DAYS_MS;
    const count = history.filter((checkIn) => Date.parse(checkIn.checkedInAt) >= since).length;
    const oldest = history[history.length - 1];
    const shorterThanLimit = limit !== null && history.length < limit;
    const reachesPastWindow = !!oldest && Date.parse(oldest.checkedInAt) < since;
    return { count, complete: shorterThanLimit || reachesPastWindow };
}
// member_details.attendance: the latest present-or-late check-ins (30 at most,
// limits.attendance), newest first: { id, sessionId, title, checkedInAt, checkedOutAt }
function attendanceFromDetails(details) {
    const value = details.attendance;
    if (!Array.isArray(value))
        return null;
    const history = [];
    for (const entry of value) {
        if (!isObject(entry) || !isText(entry.title) || !isText(entry.checkedInAt))
            return null;
        if (!Number.isFinite(Date.parse(entry.checkedInAt)))
            return null;
        history.push({ sessionTitle: entry.title, checkedInAt: entry.checkedInAt });
    }
    return {
        latest: history[0] ?? null,
        lastSevenDays: lastSevenDays(history, limitOf(details, "attendance")),
        history,
    };
}
// cache(): the People layout, its page and Do For Me share one read per request
const readHubMembers = (0, react_1.cache)(async () => {
    const answer = await (0, hub_gateway_1.readHubAsStaff)("context", {});
    if (!answer.ok)
        return unavailable(answer.code);
    if (!Array.isArray(answer.result.members))
        return UNREADABLE;
    const members = [];
    for (const entry of answer.result.members) {
        const member = memberFromList(entry);
        if (!member)
            return UNREADABLE;
        members.push(member);
    }
    return { outcome: "loaded", members };
});
const readHubMember = (0, react_1.cache)(async (id) => {
    // The Hub only takes positive record ids; anything else isn't a member
    if (!/^[1-9][0-9]{0,9}$/.test(id))
        return unavailable("MEMBER_UNAVAILABLE");
    const answer = await (0, hub_gateway_1.readHubAsStaff)("member_details", { memberId: id });
    if (!answer.ok)
        return unavailable(answer.code);
    const member = memberFromDetails(answer.result);
    const attendance = attendanceFromDetails(answer.result);
    if (!member || !attendance)
        return UNREADABLE;
    // Never show a different member under /people/<id>
    if (member.id !== id)
        return UNREADABLE;
    return { outcome: "loaded", member, attendance };
});
// ---------------------------------------------------------------------------
// Every member the People pane lists (in Hub mode: the ones this staff member's
// grant can see on this site)
async function getMembers() {
    if ((0, hub_gateway_1.hubEnabled)())
        return readHubMembers();
    if (exports.USES_SAMPLE_MEMBERS)
        return { outcome: "loaded", members: member_fixture_1.devMembers };
    throw new Error(NOT_CONNECTED);
}
// One member and their attendance, for Member 360
async function getMemberRecord(id) {
    if ((0, hub_gateway_1.hubEnabled)())
        return readHubMember(id);
    if (exports.USES_SAMPLE_MEMBERS) {
        const member = member_fixture_1.devMembers.find((each) => each.id === id);
        if (!member)
            return { outcome: "missing" };
        // Sample members have no check-ins: the development kiosk uses its own students
        const attendance = {
            latest: null,
            lastSevenDays: { count: 0, complete: true },
            history: [],
        };
        return { outcome: "loaded", member, attendance };
    }
    throw new Error(NOT_CONNECTED);
}
