"use client";

import type { Member, MemberAttendance } from "@/domain/member";
import { membershipLabel } from "@/domain/member-presentation";
import { attendanceSummary, bookingsSummary } from "@/domain/memberReadPresentation";
import { TimeLabel } from "@/views/crm/localTime";
import { MemberSubscriptions } from './memberRecords';

const panel = "rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5";
const muted = "text-[13px] text-(--crm-text-secondary)";

export function MemberTraining({ member }: { member: Member }) {
  return <section className={panel} aria-label="Training record"><h2 className="mb-4 font-bold text-(--crm-text)">Training</h2><dl className="space-y-3">{[
    ["Current rank", `${member.rank.name}${member.rank.stripes === undefined ? "" : ` · ${member.rank.stripes} stripes`}`],
    ["Program", member.training?.program], ["Primary instructor", member.training?.primaryInstructor],
    ["Team", member.training?.team], ["Home location", member.training?.homeLocation],
  ].filter(([label, value]) => label === 'Current rank' || value !== undefined).map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-(--crm-line) pb-3 text-[13px]"><dt className="text-(--crm-muted)">{label}</dt><dd className="text-(--crm-text)">{value}</dd></div>)}</dl><p className="mt-4 text-[12px] text-(--crm-muted)">Course-roster assignments are shown below. Program, primary-instructor, team and home-location assignments are not supplied by this read. Progress contains the available testing workflow; curriculum and instructor-assessment evidence require additional contracts.</p></section>;
}

export function MemberBookings({ member }: { member: Member }) {
  const bookings = member.bookings;
  return <section className={panel} aria-label="Registered sessions"><h2 className="font-bold text-(--crm-text)">Registered sessions</h2>
    {bookings === undefined ? <p className={`${muted} mt-3`}>Bookings are unavailable in this read.</p> : <>
      <p className="mt-2 text-[12px] text-(--crm-muted)">{bookingsSummary(member)}</p>
      <ul className="mt-4 divide-y divide-(--crm-line)">{bookings.map((booking, index) => <li key={`${booking.sessionId}:${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-[13px]"><span className="font-semibold text-(--crm-text)">{booking.title}</span><span className="text-(--crm-text-secondary)"><TimeLabel iso={booking.startsAt} /></span></li>)}</ul>
      {bookings.length === 0 && !member.bookingsCapped && <p className={`${muted} mt-3`}>No registered sessions were returned.</p>}
    </>}
    <p className="mt-4 text-[12px] text-(--crm-muted)">These rows show registered sessions. Use the reviewed booking actions to reserve or change a class. Only an attendance record confirms a check-in.</p>
  </section>;
}

export function MemberAttendanceHistory({ attendance, timeline = false }: { attendance: MemberAttendance; timeline?: boolean }) {
  const { complete } = attendance.lastSevenDays;
  const history = attendance.history;
  return <section className={panel} aria-label={timeline ? "Attendance timeline" : "Attendance history"}><h2 className="font-bold text-(--crm-text)">{timeline ? "Attendance timeline" : "Attendance"}</h2><p className="mt-2 text-[13px] text-(--crm-text-secondary)">{attendanceSummary(attendance.lastSevenDays)}</p>
    <p className="mt-2 text-[12px] text-(--crm-muted)">{timeline ? "This timeline contains attendance only; messages, payments and other activity are not included." : "Recent check-ins supplied by the source; this is not a lifetime total or attendance percentage."}</p>
    {history === undefined ? <p className={`${muted} mt-4`}>Attendance history is unavailable.</p> : history.length === 0 ? <p className={`${muted} mt-4`}>{complete ? "No attendance entries were returned." : "No entries were included; the source does not establish a complete history."}</p> : <ol className="mt-4 divide-y divide-(--crm-line)">{history.map((entry, index) => <li key={`${entry.checkedInAt}:${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-[13px]"><div><p className="font-semibold text-(--crm-text)">{entry.sessionTitle}</p><p className="mt-1 text-[11px] text-(--crm-muted)">Checked in{entry.late ? " · Late" : ""}</p></div><span className="text-(--crm-text-secondary)"><TimeLabel iso={entry.checkedInAt} /></span></li>)}</ol>}
  </section>;
}

export function MemberMembership({ member }: { member: Member }) {
  return <div className="space-y-4"><section className={panel}><h2 className="font-bold text-(--crm-text)">Membership</h2><p className="mt-3 text-lg text-(--crm-text)">{membershipLabel(member)}</p><p className="mt-3 text-[12px] text-(--crm-muted)">This is the recorded student state. Subscription records below provide the linked plan information available to your role.</p></section><MemberSubscriptions member={member} /><MemberBookings member={member} /></div>;
}

export function MemberContact({ member }: { member: Member }) {
  return <section className={`${panel} mb-4`} aria-label="Contact details"><h2 className="mb-3 text-sm font-bold text-(--crm-text)">Contact</h2><dl className="grid gap-3 text-[13px] sm:grid-cols-2"><div><dt className="text-(--crm-muted)">Phone</dt><dd className="mt-1 text-(--crm-text)">{member.phone ? <a className="underline underline-offset-4" href={`tel:${member.phone.replace(/[^+\d]/g, "")}`}>{member.phone}</a> : "Not provided or not visible to your role"}</dd></div><div><dt className="text-(--crm-muted)">Email</dt><dd className="mt-1 break-all text-(--crm-text)">{member.email ? <a className="underline underline-offset-4" href={`mailto:${encodeURIComponent(member.email)}`}>{member.email}</a> : "Not provided or not visible to your role"}</dd></div></dl><p className="mt-3 text-[11px] text-(--crm-muted)">Contact links open your device’s phone or email app. DreamOS does not send a message.</p></section>;
}
