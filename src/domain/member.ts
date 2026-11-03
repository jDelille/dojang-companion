// A Dojang member as the CRM shows it (Member 360). Ported from Companion 1cab554b
// src/domain/member.ts. Not the same as types/members.ts, which is the gym template's
// own sample member.
//
// Two sources fill it (src/integrations/member.ts): the development fixture, and
// the real Hub (Odoo "context" and "member_details"). Fields the Hub doesn't send
// are optional and stay empty for real members; screens show "Not recorded".

export type MembershipState =
  "lead" | "trial" | "active" | "paused" | "cancelled";

export type Rank = {
  name: string; // "Blue Belt"
  stripes?: number; // stripes on the current belt; not in the Hub's member list
};

export type Member = {
  records?: import('./memberRecords').MemberRecords;
  photo?: string;
  tenantId?: string; // which school (fixture only; the Hub scopes by site instead)
  id: string; // in Hub mode, the Odoo dojo.member id (the same id the Inbox links to)
  memberNumber?: string; // not in the Hub's member reads
  name: string;
  // Only present when the authoritative read supplies a visible contact field.
  email?: string;
  phone?: string;
  membershipState: MembershipState;
  rank: Rank;
  householdName?: string; // "Chen Family"
  nextClass?: string; // "5:45 PM"
  testReadiness?: number; // 0–100
  attendanceRate?: number; // 0–1; nobody has defined it for the Hub yet
  bookings?: MemberBooking[]; // absent = unavailable (or unreadable); [] = no registered sessions
  // true: the source sent as many bookings as its limit allows, so there may be
  // more than the list holds. Show the count as "at least".
  bookingsCapped?: boolean;
  // Member 360's Training card and Member story. Nothing sends these yet, so the
  // page shows "Not recorded". Never fill them from mockups.
  training?: MemberTraining;
  joinedOn?: string; // "2025-01-14"
  classesAttended?: number; // all-time count
};

export type MemberTraining = {
  program?: string;
  primaryInstructor?: string;
  team?: string;
  homeLocation?: string;
};

export type MemberBooking = {
  sessionId: string;
  title: string;
  startsAt: string;
  endsAt?: string; // the Hub's bookings have no end time
};

// One attended class
export type CheckIn = {
  sessionTitle: string; // "Children Advanced"
  checkedInAt: string; // ISO time; the browser formats it
  late?: boolean; // the Hub counts present and late check-ins but doesn't say which
};

// A count over a time window.
//   complete: true   every event in the window was counted (exact)
//   complete: false  the source's list was cut off inside the window, so the
//                    real number may be higher; show it as "at least"
export type WindowCount = { count: number; complete: boolean };

// What Member 360 knows about attendance. No attendance % on purpose: nobody has
// defined it yet. The Hub sends only the latest 30 check-ins.
export type MemberAttendance = {
  latest: CheckIn | null; // null = no check-ins yet
  lastSevenDays: WindowCount; // rolling 7 days, so it doesn't depend on a time zone
  history?: CheckIn[]; // newest first; left out when the source can't send it
};
