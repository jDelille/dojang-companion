'use client';

import type { Member } from '@/domain/member';
import { sectionUnavailable, type SectionRead } from '@/domain/memberRecords';

const panel = 'rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5';
const muted = 'text-[12px] text-(--crm-muted)';
function ReadState({ read, empty }: { read: SectionRead<{ id: string }> | undefined; empty: string }) {
  if (!read) return <p className={`${muted} mt-3`}>Not provided by this read.</p>;
  if (read.outcome === 'unavailable') return <p role={read.reason === 'unreadable' ? 'alert' : undefined} className={`${muted} mt-3`}>{sectionUnavailable(read.reason)}</p>;
  return <p className={`${muted} mt-3`}>{read.rows.length === 0 ? read.capped ? 'No rows were included; completeness is not established.' : empty : `${read.rows.length} records returned${read.capped ? '; the source may have more' : ''}.`}</p>;
}
function money(amount: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount); }
  catch { return `${currency} ${amount.toLocaleString()}`; }
}
const label = (s: string) => s.replaceAll('_', ' ');

export function MemberRankHistory({ member }: { member: Member }) {
  const read = member.records?.rankHistory;
  return <section className={panel} aria-label="Recorded rank history"><h2 className="font-bold text-(--crm-text)">Rank history</h2>
    <p className="mt-2 text-[13px] text-(--crm-text-secondary)">Current rank: {member.rank.name}{member.rank.stripes === undefined ? '' : ` · ${member.rank.stripes} stripes`}</p>
    <ReadState read={read} empty="Odoo returned no rank awards." />
    {read?.outcome === 'loaded' && <ol className="mt-4 divide-y divide-(--crm-line)">{read.rows.map(award => <li key={award.id} className="flex flex-wrap justify-between gap-2 py-3 text-[13px]"><span className="font-semibold text-(--crm-mastery)">{award.rank} · {award.stripes} stripes</span><span className="text-(--crm-text-secondary)">{award.date}</span></li>)}</ol>}
    <p className={`${muted} mt-4`}>Recorded awards are not promotion eligibility, assessment results, or testing readiness. Rank changes require a separate governed action.</p>
  </section>;
}

export function MemberCourses({ member }: { member: Member }) {
  const read = member.records?.courses;
  return <section className={panel} aria-label="Course roster memberships"><h2 className="font-bold text-(--crm-text)">Course rosters</h2>
    <ReadState read={read} empty="Odoo returned no course-roster assignments." />
    {read?.outcome === 'loaded' && <ul className="mt-3 divide-y divide-(--crm-line)">{read.rows.map(course => <li key={course.id} className="py-3 text-[13px] text-(--crm-text)">{course.name}<span className="ml-2 text-[11px] text-(--crm-muted)">Course #{course.id}</span></li>)}</ul>}
    <p className={`${muted} mt-4`}>A course-roster assignment is distinct from a paid membership and a reservation for an individual class.</p>
  </section>;
}

export function MemberSubscriptions({ member }: { member: Member }) {
  const read = member.records?.subscriptions;
  return <section className={panel} aria-label="Membership subscriptions"><h2 className="font-bold text-(--crm-text)">Membership plans</h2>
    <ReadState read={read} empty="Odoo returned no linked membership subscriptions." />
    {read?.outcome === 'loaded' && <ul className="mt-4 divide-y divide-(--crm-line)">{read.rows.map(subscription => <li key={subscription.id} className="space-y-1 py-3 text-[13px]"><p className="font-semibold text-(--crm-text)">{subscription.plan} · {label(subscription.state)}</p><p className="text-(--crm-text-secondary)">Next invoice date: {subscription.nextInvoiceDate ?? 'No next invoice date supplied'}</p><p className={muted}>Subscription #{subscription.id}</p></li>)}</ul>}
    <p className={`${muted} mt-4`}>Subscription state and next invoice date are shown as Odoo returns them. A next invoice date is not a renewal or expiry date.</p>
  </section>;
}

export function MemberBilling({ member }: { member: Member }) {
  const read = member.records?.invoices;
  return <div className="space-y-4"><MemberSubscriptions member={member} /><section className={panel} aria-label="Linked invoices and credit notes"><h2 className="font-bold text-(--crm-text)">Invoices and credit notes</h2>
    <ReadState read={read} empty="Odoo returned no posted invoices or credit notes linked through these subscriptions." />
    {read?.outcome === 'loaded' && read.rows.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-[12px]"><caption className="sr-only">Posted billing records linked through this student’s subscriptions</caption><thead><tr className="border-b border-(--crm-line) text-(--crm-muted)">{['Record', 'Date', 'Payment state', 'Scope', 'Total', 'Remaining'].map(h => <th key={h} scope="col" className="p-2 font-semibold">{h}</th>)}</tr></thead><tbody>{read.rows.map(invoice => <tr key={invoice.id} className="border-b border-(--crm-line) text-(--crm-text-secondary)"><th scope="row" className="p-2 font-medium text-(--crm-text)">{invoice.number}<span className="mt-1 block text-[11px] text-(--crm-muted)">{invoice.kind === 'out_refund' ? 'Credit note' : 'Invoice'} #{invoice.id}</span></th><td className="p-2">{invoice.date ?? 'Date not supplied'}</td><td className="p-2">{label(invoice.paymentState)}</td><td className="p-2">{invoice.scope === 'household' ? 'Household · shared' : 'Member'}</td><td className="whitespace-nowrap p-2">{money(invoice.total, invoice.currency)}</td><td className="whitespace-nowrap p-2">{money(invoice.remaining, invoice.currency)}</td></tr>)}</tbody></table></div>}
    <p className={`${muted} mt-4`}>Household invoices may cover other students. These records are not summed into a personal balance. Payments, refunds and payment links require separate authorized workflows.</p>
  </section></div>;
}
