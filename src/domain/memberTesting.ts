import { object, recordId, nonnegative, string } from './memberActions';
export type TestingCatalog = { ranks: { id: string; name: string; sequence: number }[]; tests: { id: string; name: string; date: string; state: string; count: number }[]; member: { memberId: string; openTest: { testId: string; name: string } | null } | null; capped: boolean };
export type TestRegistration = { registrationId: string; memberId: string; name: string; currentRank: string | null; targetRank: string; result: 'pending' | 'pass' | 'fail' | 'withdrew'; promotionId: string | null };
export type MemberTest = { test: { id: string; name: string; date: string; state: string; version: number }; rows: TestRegistration[]; school: string };
export type PromotionHistory = { id: string; memberId: string; rank: string; stripes: number; date: string; memberVersion: number; source: string; reversed: boolean; reversedBy: string | null; reversalReason: string | null; latest: boolean };
const nullable = (v: unknown): v is string | null => v === null || string(v);
const day = (v: unknown): v is string => string(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
export function testingCatalogFrom(v: unknown, memberId: string): TestingCatalog | null {
  if (!object(v) || !Array.isArray(v.rows) || v.rows.length > 500 || !Array.isArray(v.ranks) || v.ranks.length > 200 || !Array.isArray(v.tests) || v.tests.length > 50) return null;
  const ranks: TestingCatalog['ranks'] = [], tests: TestingCatalog['tests'] = [];
  for (const r of v.ranks) { if (!object(r) || !recordId(r.id) || !string(r.name) || typeof r.sequence !== 'number' || !Number.isSafeInteger(r.sequence)) return null; ranks.push({ id: r.id, name: r.name, sequence: r.sequence }); }
  for (const t of v.tests) { if (!object(t) || !recordId(t.id) || !string(t.name) || !day(t.date) || !string(t.state) || !nonnegative(t.count)) return null; tests.push({ id: t.id, name: t.name, date: t.date, state: t.state, count: t.count }); }
  if (!v.rows.every(r => object(r) && recordId(r.memberId)) || new Set(v.rows.map(r => (r as Record<string, unknown>).memberId)).size !== v.rows.length || new Set(ranks.map(r => r.id)).size !== ranks.length || new Set(tests.map(t => t.id)).size !== tests.length) return null;
  const matches = (v.rows as Record<string, unknown>[]).filter(r => r.memberId === memberId);
  if (matches.length > 1) return null;
  const r = matches[0]; let openTest: TestingCatalog['member'] = null;
  if (r) { if (!(r.openTest === null || (object(r.openTest) && recordId(r.openTest.testId) && string(r.openTest.name)))) return null;
    openTest = { memberId, openTest: object(r.openTest) ? { testId: r.openTest.testId as string, name: r.openTest.name as string } : null }; }
  return { ranks, tests, member: openTest, capped: v.rows.length === 500 || tests.length === 50 };
}
export function memberTestFrom(v: unknown, testId: string): MemberTest | null {
  if (!object(v) || !object(v.test) || v.test.id !== testId || !string(v.test.name) || !day(v.test.date) || !string(v.test.state) || !nonnegative(v.test.version) || !string(v.school) || !Array.isArray(v.rows) || v.rows.length > 5000) return null;
  const result: TestRegistration[] = [];
  for (const r of v.rows) { if (!object(r) || !recordId(r.registrationId) || !recordId(r.memberId) || !string(r.name) || !nullable(r.currentRank) || !string(r.targetRank) || !string(r.result) || !['pending', 'pass', 'fail', 'withdrew'].includes(r.result) || !(r.promotionId === null || recordId(r.promotionId))) return null;
    result.push({ registrationId: r.registrationId, memberId: r.memberId, name: r.name, currentRank: r.currentRank, targetRank: r.targetRank, result: r.result as TestRegistration['result'], promotionId: r.promotionId }); }
  if (new Set(result.map(r => r.registrationId)).size !== result.length || new Set(result.map(r => r.memberId)).size !== result.length) return null;
  return { test: { id: testId, name: v.test.name, date: v.test.date, state: v.test.state, version: v.test.version }, rows: result, school: v.school };
}
export function promotionHistoryFrom(v: unknown, memberId: string): { rows: PromotionHistory[]; capped: boolean } | null {
  if (!object(v) || !Array.isArray(v.rows) || v.rows.length > 100 || typeof v.more !== 'boolean') return null;
  const rows: PromotionHistory[] = [];
  for (const r of v.rows) {
    if (!object(r) || !recordId(r.id) || !recordId(r.memberId)) return null;
    if (r.memberId !== memberId) continue;
    if (!string(r.rank) || !nonnegative(r.stripes) || !day(r.date) || !nonnegative(r.memberVersion) || !string(r.source) || typeof r.reversed !== 'boolean' || typeof r.latest !== 'boolean' || !nullable(r.reversedBy) || !nullable(r.reversalReason)) return null;
    rows.push({ id: r.id, memberId, rank: r.rank, stripes: r.stripes, date: r.date, memberVersion: r.memberVersion, source: r.source, reversed: r.reversed, reversedBy: r.reversedBy, reversalReason: r.reversalReason, latest: r.latest });
  }
  return new Set(rows.map(r => r.id)).size === rows.length ? { rows, capped: v.more } : null;
}
