"use client";
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { operationsRangeAllowed, operationsReportFrom, type OperationsRange, type OperationsReport } from '@/domain/operations';
import { classDay } from '@/domain/classMove';
import { attendanceLabel } from '@/domain/arrivals';
import { explainHubError } from '@/domain/hubAction';
import { memberRead } from '@/integrations/memberActions';
import { getSessionRoster, SIGN_IN_CODES, type SessionRosterAnswer } from '@/integrations/hub';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Input, Select } from '@/templates/roster/components/ui/form';
import MemberTools, { type MemberTool } from '@/views/people/memberTools';
import type { TodaySession } from '@/domain/today';
const card = 'rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-4';
export default function OperationsPanel({ manager, sessions, selection, onSelect, onAuthenticationLost, onLockChange }: { manager: boolean; sessions: TodaySession[]; selection: { id: string; attempt: number }; onLockChange: (locked: boolean) => void; onSelect: (id: string) => void; onAuthenticationLost: () => void }) {
  const [range, setRange] = useState<(OperationsRange & { attempt: number }) | null>(null);
  const [report, setReport] = useState<OperationsReport | null>(null), [error, setError] = useState('');
  const [roster, setRoster] = useState<SessionRosterAnswer | null>(null), [search, setSearch] = useState(''), [status, setStatus] = useState('all');
  const [tool, setTool] = useState<{ memberId: string; tool: MemberTool } | null>(null);
  useEffect(() => { onLockChange(tool !== null); }, [tool, onLockChange]);
  useEffect(() => {
    if (!range || !manager) return;
    let cancelled = false; const abort = new AbortController();
    void memberRead('operations_report', { fromDate: range.fromDate, toDate: range.toDate }, AbortSignal.any([abort.signal, AbortSignal.timeout(45000)])).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') { const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'; if (SIGN_IN_CODES.includes(code)) onAuthenticationLost(); else setError(code); return; }
      const parsed = operationsReportFrom(answer.result, range); if (!parsed) setError('HUB_RESPONSE_UNREADABLE'); else setReport(parsed);
    });
    return () => { cancelled = true; abort.abort(); };
  }, [range, manager, onAuthenticationLost]);
  useEffect(() => {
    if (!selection.id) return;
    let cancelled = false;
    void getSessionRoster(selection.id).then(next => { if (!cancelled) { if (next.outcome === 'unavailable' && SIGN_IN_CODES.includes(next.code ?? '')) onAuthenticationLost(); else setRoster(next); } });
    return () => { cancelled = true; };
  }, [selection, onAuthenticationLost]);
  function choose(id: string) { setRoster(null); setSearch(''); setStatus('all'); onSelect(id); }
  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget), next = { fromDate: String(f.get('fromDate')), toDate: String(f.get('toDate')) };
    setReport(null); setError(''); if (!operationsRangeAllowed(next)) { setError('INVALID_REPORT_RANGE'); return; }
    setRange({ ...next, attempt: (range?.attempt ?? 0) + 1 });
  }
  const classes = new Map(sessions.map(s => [s.id, { id: s.id, name: s.title, startsAt: s.startsAt }]));
  report?.classes.forEach(c => classes.set(c.id, c));
  const loaded = roster?.outcome === 'loaded' && roster.roster.session.id === selection.id ? roster.roster : null;
  const shown = loaded?.members.filter(m => m.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) && (status === 'all' || m.attendance === status)) ?? [];
  const when = (iso: string, zone: string) => new Date(iso).toLocaleString([], { timeZone: zone });
  return <div className="roster-scope space-y-4" id="operations-workspace">
    {manager && <section className={card} aria-label="Operations report"><h2 className="font-semibold">Operations pulse and reports</h2><p className="mt-2 text-xs muted">Choose up to 31 days. Class and shift dates use the school timezone. Missing attendance is not counted as absence.</p>
      <form onSubmit={run} inert={tool !== null} className="mt-4 flex flex-wrap items-end gap-3"><Field label="From"><Input name="fromDate" type="date" defaultValue={classDay(null)} required /></Field><Field label="Through"><Input name="toDate" type="date" defaultValue={classDay(null)} required /></Field><Button type="submit" disabled={!!range && !report && !error}>Load report</Button></form>
      {range && !report && !error && <p role="status" className="mt-3 text-xs">Loading school operations...</p>}
      {error && <p role="alert" className="mt-3 text-xs">{error === 'REPORT_TOO_LARGE' ? 'This report exceeds the safe limit. Choose a smaller date range.' : error === 'INVALID_REPORT_RANGE' ? 'Choose a valid range of at most 31 calendar days.' : explainHubError(error)}</p>}
      {report && <div className="mt-4 space-y-5"><p className="text-xs muted">{report.fromDate} through {report.toDate} / {report.timeZone} / Updated {when(report.generatedAt, report.timeZone)}</p>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Classes in range', report.sessions], ['Attended records', report.attendance.attended], ['Recorded outcomes', report.attendance.recorded], ['Unassigned classes', report.unassignedSessions]].map(([label, value]) => <div key={label} className="rounded-lg border border-(--crm-line) p-3"><dt className="text-xs muted">{label}</dt><dd className="mt-1 text-xl font-semibold">{value}</dd></div>)}</dl>
        <p className="text-xs muted">{report.scope}</p>
        <details><summary className="cursor-pointer text-sm font-semibold">Daily attendance</summary>{!report.attendance.daily.length && <p className="mt-3 text-xs">No attendance records in this class-date range.</p>}<ul className="mt-3 space-y-2 text-xs">{report.attendance.daily.map(d => <li key={d.date}><strong>{d.date}</strong> / {Object.entries(d.counts).map(([state, count]) => `${attendanceLabel(state)}: ${count}`).join(' / ')}</li>)}</ul></details>
        <details><summary className="cursor-pointer text-sm font-semibold">Instructor workload</summary><ul className="mt-3 space-y-3 text-xs">{report.workload.map(w => <li key={w.id}><strong>{w.name}</strong><p>{w.sessions} classes / {w.scheduledHours.toFixed(2)} scheduled hours / {w.closedShiftHours.toFixed(2)} closed-shift hours / {w.openShifts} open shifts</p></li>)}</ul>{!report.workload.length && <p className="mt-3 text-xs">No linked instructor activity in this range.</p>}<p className="mt-3 text-xs muted">Scheduled time and recorded shift time measure different records. Neither is payroll approval.</p></details>
        <details><summary className="cursor-pointer text-sm font-semibold">Current rank and household snapshot</summary><p className="mt-3 text-xs">{report.family.households} households / {report.family.membersInHouseholds} member records in households / {report.family.membersWithoutHousehold} without a household.</p><ul className="mt-3 flex flex-wrap gap-3 text-xs">{report.beltDistribution.map(b => <li key={b.name}>{b.name}: {b.members}</li>)}</ul><p className="mt-3 text-xs muted">Current unarchived member records, not historical membership totals for the selected dates.</p></details>
        <details><summary className="cursor-pointer text-sm font-semibold">Classes in this report ({report.classes.length})</summary><ul className="mt-3 space-y-2 text-xs">{report.classes.map(c => <li key={c.id}><button type="button" className="underline" onClick={() => choose(c.id)}>{c.name} / {when(c.startsAt, report.timeZone)}</button></li>)}</ul></details>
      </div>}
    </section>}
    <section className={card} aria-label="Class roster workspace"><h2 className="font-semibold">Class roster workspace</h2><p className="mt-2 text-xs muted">Open a class to review registered students and their recorded attendance. Students without an attendance record are not automatically absent.</p>
      <div className="mt-3"><Select aria-label="Class roster" value={selection.id} disabled={tool !== null} onChange={e => choose(e.target.value)}><option value="">Choose a class</option>{[...classes.values()].map(c => <option key={c.id} value={c.id}>{c.name}{c.startsAt ? ` / ${new Date(c.startsAt).toLocaleString()}` : ''}</option>)}</Select></div>
      {selection.id && !roster && <p role="status" className="mt-3 text-xs">Loading registered class roster...</p>}
      {roster?.outcome === 'unavailable' && <div role="alert" className="mt-3 text-xs"><p>{roster.text}</p><Button size="sm" onClick={() => choose(selection.id)}>Retry roster</Button></div>}
      {loaded && <div className="mt-4 space-y-3"><p className="text-sm font-semibold">{loaded.session.name} / {when(loaded.session.startsAt, loaded.timeZone)}</p><p className="text-xs muted">{loaded.session.instructor ?? 'No instructor assigned'} / {loaded.timeZone} / {loaded.members.length} registered / {loaded.session.state}</p>
        <div className="flex flex-wrap gap-3"><Input aria-label="Search roster students" placeholder="Search registered students" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" /><Select aria-label="Attendance filter" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All attendance states</option>{[...new Set(loaded.members.map(m => m.attendance))].map(s => <option key={s} value={s}>{attendanceLabel(s)}</option>)}</Select></div>
        <p role="status" className="text-xs muted">{shown.length} matching of {loaded.members.length} registered students.</p>
        <ul className="divide-y divide-(--crm-line)">{[...shown].sort((a, b) => Number(b.attendance === 'pending') - Number(a.attendance === 'pending') || a.name.localeCompare(b.name)).map(m => <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><Link href={`/people/${m.id}`} className="text-sm font-semibold underline">{m.name}</Link><p className="text-xs muted">{m.rank} / {attendanceLabel(m.attendance)}</p></div><Button size="sm" disabled={!!tool} onClick={() => setTool({ memberId: m.id, tool: 'attendance' })}>Review staff attendance</Button></li>)}</ul>
        {!shown.length && <p className="text-xs">No matching registered students.</p>}
      </div>}
    </section>
    {tool && <MemberTools memberId={tool.memberId} tool={tool.tool} onAuthenticationLost={onAuthenticationLost} onClose={() => { setTool(null); choose(selection.id); }} />}
  </div>;
}
