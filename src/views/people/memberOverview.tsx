"use client";

import type { Member, MemberAttendance } from "@/domain/member";
import { membershipLabel } from "@/domain/member-presentation";
import { attendanceSummary, bookingsSummary } from "@/domain/memberReadPresentation";
import { sectionUnavailable } from "@/domain/memberRecords";
import { TimeLabel } from "@/views/crm/localTime";

const card = "rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5";
const action = "text-[12px] font-semibold text-(--crm-text) underline underline-offset-4";
export default function MemberOverview({ member, attendance, onTab }: {
  member: Member; attendance: MemberAttendance; onTab?: (tab: string) => void;
}) {
  const courses = member.records?.courses, subscriptions = member.records?.subscriptions, awards = member.records?.rankHistory;
  const history = attendance.history?.slice(0, 3) ?? (attendance.latest ? [attendance.latest] : []);
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <section className={card} aria-label="Member story"><h2 className="font-bold text-(--crm-text)">Member story</h2>
      <p className="mt-3 text-lg font-semibold text-(--crm-text)">{membershipLabel(member)} student ? {member.rank.name}{member.rank.stripes === undefined ? '' : ` ? ${member.rank.stripes} stripes`}</p>
      <dl className="mt-4 space-y-3 text-[13px]"><div><dt className="text-(--crm-muted)">Recent attendance</dt><dd className="mt-1 text-(--crm-text-secondary)">{attendanceSummary(attendance.lastSevenDays)}</dd></div><div><dt className="text-(--crm-muted)">Registered classes</dt><dd className="mt-1 text-(--crm-text-secondary)">{bookingsSummary(member)}</dd></div></dl>
      {onTab && <div className="mt-4 flex flex-wrap gap-4"><button type="button" className={action} onClick={() => onTab('Attendance')}>Review attendance</button><button type="button" className={action} onClick={() => onTab('Bookings')}>Review bookings</button></div>}
      <p className="mt-4 text-[11px] text-(--crm-muted)">Attendance is a bounded source read. No lifetime class count, attendance percentage, retention score or join date is inferred from it.</p>
    </section>
    <section className={card} aria-label="Training summary"><h2 className="font-bold text-(--crm-text)">Training and progression</h2><h3 className="mt-4 text-[12px] font-semibold text-(--crm-muted)">Assigned course rosters</h3>
      {courses?.outcome === 'loaded' ? <><ul className="mt-2 space-y-2 text-[13px] text-(--crm-text-secondary)">{courses.rows.slice(0, 4).map(c => <li key={c.id}>{c.name}</li>)}</ul>{courses.rows.length === 0 && <p className="mt-2 text-[13px] text-(--crm-muted)">No course assignments were returned.</p>}{(courses.capped || courses.rows.length > 4) && <p className="mt-2 text-[11px] text-(--crm-muted)">More course records may be available in Training.</p>}</> : <p className="mt-2 text-[13px] text-(--crm-muted)">{courses?.outcome === 'unavailable' ? sectionUnavailable(courses.reason) : 'Course assignments are not supplied by this read.'}</p>}
      <p className="mt-4 text-[13px] text-(--crm-text-secondary)">{awards?.outcome === 'loaded' ? `${awards.rows.length} rank awards in the returned history${awards.capped ? '; more may exist' : ''}.` : 'Rank award history is unavailable in this read.'}</p>
      {onTab && <div className="mt-4 flex flex-wrap gap-4"><button type="button" className={action} onClick={() => onTab('Training')}>Open training</button><button type="button" className={action} onClick={() => onTab('Progress')}>Review eligibility and testing</button></div>}
      <p className="mt-4 text-[11px] text-(--crm-muted)">Course membership is separate from program, instructor and location assignment. Testing attendance evidence is separate from curriculum completion and instructor assessment.</p>
    </section>
    <section className={card} aria-label="Membership summary"><h2 className="font-bold text-(--crm-text)">Membership and billing</h2>
      {subscriptions?.outcome === 'loaded' ? <><ul className="mt-3 space-y-3 text-[13px]">{subscriptions.rows.slice(0, 3).map(s => <li key={s.id}><p className="font-semibold text-(--crm-text)">{s.plan} ? {s.state.replaceAll('_', ' ')}</p><p className="mt-1 text-(--crm-text-secondary)">Next invoice: {s.nextInvoiceDate ?? 'Date not supplied'}</p></li>)}</ul>{subscriptions.rows.length === 0 && <p className="mt-3 text-[13px] text-(--crm-muted)">No linked membership subscriptions were returned.</p>}{(subscriptions.capped || subscriptions.rows.length > 3) && <p className="mt-2 text-[11px] text-(--crm-muted)">Membership contains more of the returned plan history.</p>}</> : <p className="mt-3 text-[13px] text-(--crm-muted)">{subscriptions?.outcome === 'unavailable' ? sectionUnavailable(subscriptions.reason) : 'Membership subscriptions are not supplied by this read.'}</p>}
      {onTab && <div className="mt-4 flex flex-wrap gap-4"><button type="button" className={action} onClick={() => onTab('Membership')}>Open membership</button><button type="button" className={action} onClick={() => onTab('Billing')}>Invoices, settlement and refunds</button></div>}
      <p className="mt-4 text-[11px] text-(--crm-muted)">Shared household invoices are not added up as a personal student balance. Next invoice date is not a confirmed renewal or payment.</p>
    </section>
    <section className={card} aria-label="Recent member activity"><h2 className="font-bold text-(--crm-text)">Recent recorded attendance</h2>
      {history.length > 0 ? <ul className="mt-3 divide-y divide-(--crm-line)">{history.map((entry, i) => <li key={`${entry.checkedInAt}:${i}`} className="space-y-1 py-3 text-[13px]"><p className="font-semibold text-(--crm-text)">{entry.sessionTitle}</p><p className="text-(--crm-text-secondary)"><TimeLabel iso={entry.checkedInAt} /></p></li>)}</ul> : <p className="mt-3 text-[13px] text-(--crm-muted)">{attendance.history === undefined ? 'Recent attendance is unavailable.' : attendance.lastSevenDays.complete ? 'No attendance entries were returned.' : 'No entries were included; the source does not establish a complete history.'}</p>}
      {onTab && <div className="mt-4 flex flex-wrap gap-4"><button type="button" className={action} onClick={() => onTab('Timeline')}>Open action timeline</button><button type="button" className={action} onClick={() => onTab('Family')}>Household and guardians</button><button type="button" className={action} onClick={() => onTab('Messages')}>Linked messages</button></div>}
      <p className="mt-4 text-[11px] text-(--crm-muted)">The Timeline tab also shows member-linked Hub actions. Communication windows are available in Messages.</p>
    </section>
  </div>;
}
