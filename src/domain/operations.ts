import { object, recordId, nonnegative, string } from './memberActions';
export type OperationsRange = { fromDate: string; toDate: string };
const day = (v: unknown): v is string => string(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
export function operationsRangeAllowed(v: Record<string, unknown>): v is OperationsRange {
  return Object.keys(v).sort().join() === 'fromDate,toDate' && day(v.fromDate) && day(v.toDate) && Date.parse(v.toDate) >= Date.parse(v.fromDate) && Date.parse(v.toDate) - Date.parse(v.fromDate) <= 30 * 86400000;
}
export type OperationsReport = { fromDate: string; toDate: string; timeZone: string; generatedAt: string; scope: string;
  sessions: number; classes: { id: string; name: string; startsAt: string }[];
  attendance: { recorded: number; attended: number; daily: { date: string; counts: Record<string, number> }[] };
  workload: { id: string; name: string; sessions: number; scheduledHours: number; closedShiftHours: number; openShifts: number }[];
  unassignedSessions: number; beltDistribution: { name: string; members: number }[];
  family: { households: number; membersInHouseholds: number; membersWithoutHousehold: number };
};
const stamp = (v: unknown): v is string => string(v) && Number.isFinite(Date.parse(v));
const hours = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const list = (v: unknown, check: (r: Record<string, unknown>) => boolean): v is Record<string, unknown>[] => Array.isArray(v) && v.length <= 10000 && v.every(r => object(r) && check(r));
const unique = (rows: Record<string, unknown>[], key: string) => new Set(rows.map(r => r[key])).size === rows.length;
export function operationsReportFrom(v: unknown, range: OperationsRange): OperationsReport | null {
  if (!object(v) || v.fromDate !== range.fromDate || v.toDate !== range.toDate || !string(v.timeZone) || !stamp(v.generatedAt) || !string(v.scope)) return null;
  try { new Intl.DateTimeFormat('en', { timeZone: v.timeZone }); } catch { return null; }
  if (!nonnegative(v.sessions) || !nonnegative(v.unassignedSessions) || v.unassignedSessions > v.sessions
    || !list(v.classes, c => recordId(c.id) && string(c.name) && stamp(c.startsAt)) || !unique(v.classes, 'id') || v.classes.length !== v.sessions
    || !object(v.attendance) || !nonnegative(v.attendance.recorded) || !nonnegative(v.attendance.attended) || v.attendance.attended > v.attendance.recorded
    || !list(v.attendance.daily, d => day(d.date) && d.date >= range.fromDate && d.date <= range.toDate && object(d.counts) && Object.values(d.counts).every(nonnegative)) || !unique(v.attendance.daily, 'date')
    || !list(v.workload, w => recordId(w.id) && string(w.name) && nonnegative(w.sessions) && hours(w.scheduledHours) && hours(w.closedShiftHours) && nonnegative(w.openShifts)) || !unique(v.workload, 'id')
    || !list(v.beltDistribution, b => string(b.name) && nonnegative(b.members)) || !unique(v.beltDistribution, 'name')
    || !object(v.family) || !nonnegative(v.family.households) || !nonnegative(v.family.membersInHouseholds) || !nonnegative(v.family.membersWithoutHousehold)) return null;
  const daily = v.attendance.daily as { date: string; counts: Record<string, number> }[];
  if (daily.reduce((sum, d) => sum + Object.values(d.counts).reduce((a, b) => a + b, 0), 0) !== v.attendance.recorded
    || daily.reduce((sum, d) => sum + (d.counts.present ?? 0) + (d.counts.late ?? 0), 0) !== v.attendance.attended) return null;
  const total = (v.family.membersInHouseholds as number) + (v.family.membersWithoutHousehold as number);
  if (v.beltDistribution.reduce((sum, r) => sum + (r.members as number), 0) !== total) return null;
  // Project named report fields; raw backend extras never become product facts.
  return { fromDate: range.fromDate, toDate: range.toDate, timeZone: v.timeZone, generatedAt: v.generatedAt, scope: v.scope,
    sessions: v.sessions, unassignedSessions: v.unassignedSessions,
    classes: v.classes.map(c => ({ id: c.id as string, name: c.name as string, startsAt: c.startsAt as string })),
    attendance: { recorded: v.attendance.recorded, attended: v.attendance.attended, daily },
    workload: v.workload.map(w => ({ id: w.id as string, name: w.name as string, sessions: w.sessions as number, scheduledHours: w.scheduledHours as number, closedShiftHours: w.closedShiftHours as number, openShifts: w.openShifts as number })),
    beltDistribution: v.beltDistribution.map(b => ({ name: b.name as string, members: b.members as number })),
    family: { households: v.family.households as number, membersInHouseholds: v.family.membersInHouseholds as number, membersWithoutHousehold: v.family.membersWithoutHousehold as number } };
}
