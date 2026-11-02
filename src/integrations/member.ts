import { cache } from "react";
import { explainHubError } from "@/domain/hubAction";
import type {
  CheckIn,
  Member,
  MemberAttendance,
  MemberBooking,
  MembershipState,
  WindowCount,
} from "@/domain/member";
import { hubEnabled, readHubAsStaff } from "@/server/hub-gateway";
import { devMembers } from "@/server/member-fixture";

// The only place People and Member 360 get member data from. Runs on the server.
//
//   DOJANG_HUB_ENABLED=true   the real Hub in Odoo, as the signed-in staff member
//                             (src/server/hub-gateway.ts). Read-only. If Odoo or
//                             sign-in fails, the answer says so; never fixture data.
//   otherwise                 the development fixture (src/server/member-fixture.ts),
//                             outside production only.

export const USES_SAMPLE_MEMBERS = !hubEnabled() && process.env.NODE_ENV !== "production";

const NOT_CONNECTED = "Member data isn't connected to Odoo yet";

// What a read gives a page. "unavailable" carries the Hub's code, so a page can
// offer sign-in for SIGN_IN_REQUIRED.
export type Unavailable = { outcome: "unavailable"; code: string; text: string };
export type MembersAnswer = { outcome: "loaded"; members: Member[] } | Unavailable;
export type MemberRecordAnswer =
  | { outcome: "loaded"; member: Member; attendance: MemberAttendance }
  | { outcome: "missing" } // no such member (fixture only; the Hub says MEMBER_UNAVAILABLE)
  | Unavailable;

const unavailable = (code: string): Unavailable => ({ outcome: "unavailable", code, text: explainHubError(code) });

// An answer DreamOS can't read is reported, not guessed around
const UNREADABLE: Unavailable = {
  outcome: "unavailable",
  code: "HUB_RESPONSE_UNREADABLE",
  text: "Odoo sent member data DreamOS can't read.",
};

// ---------------------------------------------------------------------------
// The Hub's shapes (dojo_companion_hub models/service.py)

const MEMBERSHIP_STATES: MembershipState[] = ["lead", "trial", "active", "paused", "cancelled"];

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string";
const isState = (value: unknown): value is MembershipState =>
  MEMBERSHIP_STATES.includes(value as MembershipState);

// One entry of context.members: { id, name, version, state, rank }
function memberFromList(entry: unknown): Member | null {
  if (!isObject(entry) || !isText(entry.id) || !isText(entry.name) || !isState(entry.state) || !isText(entry.rank)) {
    return null;
  }
  return { id: entry.id, name: entry.name, membershipState: entry.state, rank: { name: entry.rank } };
}

// member_details.limits: how many bookings / check-ins the Hub sends at most.
// Without a limit DreamOS can't tell a full list from a cut-off one.
function limitOf(details: Record<string, unknown>, name: string): number | null {
  const limits = details.limits;
  if (!isObject(limits)) return null;
  const limit = limits[name];
  return typeof limit === "number" && Number.isSafeInteger(limit) && limit > 0 ? limit : null;
}

// member_details.member: { id, name, version, partnerVersion, phone, email,
// dateOfBirth, photo, state, rank, stripes }. Contact fields aren't shown yet.
function memberFromDetails(details: Record<string, unknown>): Member | null {
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
    bookings,
    // No known limit: assume the list may be cut off
    bookingsCapped: bookings ? bookingsLimit === null || bookings.length >= bookingsLimit : undefined,
  };
}

// member_details.bookings: registered classes that haven't ended
// { id, sessionId, title, startsAt, attendanceState, replaceable }
// One unreadable entry makes the whole list unknown (undefined), never a
// shorter list or a confirmed 0.
function bookingsFromDetails(value: unknown): MemberBooking[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const bookings: MemberBooking[] = [];
  for (const entry of value) {
    if (!isObject(entry) || !isText(entry.sessionId) || !isText(entry.title) || !isText(entry.startsAt)) {
      return undefined;
    }
    if (!Number.isFinite(Date.parse(entry.startsAt))) return undefined;
    bookings.push({ sessionId: entry.sessionId, title: entry.title, startsAt: entry.startsAt });
  }
  return bookings;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Check-ins in the last 7 days, from a newest-first list that may be cut off at
// its limit. Exact when the list is shorter than the limit, or when it already
// reaches back past the 7 days (then every check-in inside them is in the list).
// Otherwise it's only "at least".
function lastSevenDays(history: CheckIn[], limit: number | null): WindowCount {
  const since = Date.now() - SEVEN_DAYS_MS;
  const count = history.filter((checkIn) => Date.parse(checkIn.checkedInAt) >= since).length;
  const oldest = history[history.length - 1];
  const shorterThanLimit = limit !== null && history.length < limit;
  const reachesPastWindow = !!oldest && Date.parse(oldest.checkedInAt) < since;
  return { count, complete: shorterThanLimit || reachesPastWindow };
}

// member_details.attendance: the latest present-or-late check-ins (30 at most,
// limits.attendance), newest first: { id, sessionId, title, checkedInAt, checkedOutAt }
function attendanceFromDetails(details: Record<string, unknown>): MemberAttendance | null {
  const value = details.attendance;
  if (!Array.isArray(value)) return null;
  const history: CheckIn[] = [];
  for (const entry of value) {
    if (!isObject(entry) || !isText(entry.title) || !isText(entry.checkedInAt)) return null;
    if (!Number.isFinite(Date.parse(entry.checkedInAt))) return null;
    history.push({ sessionTitle: entry.title, checkedInAt: entry.checkedInAt });
  }
  return {
    latest: history[0] ?? null,
    lastSevenDays: lastSevenDays(history, limitOf(details, "attendance")),
    history,
  };
}

// cache(): the People layout, its page and Do For Me share one read per request
const readHubMembers = cache(async (): Promise<MembersAnswer> => {
  const answer = await readHubAsStaff("context", {});
  if (!answer.ok) return unavailable(answer.code);
  if (!Array.isArray(answer.result.members)) return UNREADABLE;
  const members: Member[] = [];
  for (const entry of answer.result.members) {
    const member = memberFromList(entry);
    if (!member) return UNREADABLE;
    members.push(member);
  }
  return { outcome: "loaded", members };
});

const readHubMember = cache(async (id: string): Promise<MemberRecordAnswer> => {
  // The Hub only takes positive record ids; anything else isn't a member
  if (!/^[1-9][0-9]{0,9}$/.test(id)) return unavailable("MEMBER_UNAVAILABLE");
  const answer = await readHubAsStaff("member_details", { memberId: id });
  if (!answer.ok) return unavailable(answer.code);
  const member = memberFromDetails(answer.result);
  const attendance = attendanceFromDetails(answer.result);
  if (!member || !attendance) return UNREADABLE;
  // Never show a different member under /people/<id>
  if (member.id !== id) return UNREADABLE;
  return { outcome: "loaded", member, attendance };
});

// ---------------------------------------------------------------------------

// Every member the People pane lists (in Hub mode: the ones this staff member's
// grant can see on this site)
export async function getMembers(): Promise<MembersAnswer> {
  if (hubEnabled()) return readHubMembers();
  if (USES_SAMPLE_MEMBERS) return { outcome: "loaded", members: devMembers };
  throw new Error(NOT_CONNECTED);
}

// One member and their attendance, for Member 360
export async function getMemberRecord(id: string): Promise<MemberRecordAnswer> {
  if (hubEnabled()) return readHubMember(id);
  if (USES_SAMPLE_MEMBERS) {
    const member = devMembers.find((each) => each.id === id);
    if (!member) return { outcome: "missing" };
    // Sample members have no check-ins: the development kiosk uses its own students
    const attendance: MemberAttendance = {
      latest: null,
      lastSevenDays: { count: 0, complete: true },
      history: [],
    };
    return { outcome: "loaded", member, attendance };
  }
  throw new Error(NOT_CONNECTED);
}
