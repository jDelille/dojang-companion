'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { memberRead } from '@/integrations/memberActions';
import { testingCatalogFrom, memberTestFrom, promotionHistoryFrom, type TestingCatalog, type MemberTest, type PromotionHistory } from '@/domain/memberTesting';
import { object, nonnegative, string } from '@/domain/memberActions';
import { explainHubError } from '@/domain/hubAction';
import { classDay } from '@/domain/classMove';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Input, Select, Textarea } from '@/templates/roster/components/ui/form';
import MemberActionDialog, { type PreparedMemberAction } from './memberActionDialog';
import '@/templates/roster/roster.css';
export default function MemberTesting({ memberId, name, onAuthenticationLost }: { memberId: string; name: string; onAuthenticationLost: () => void }) {
  const [catalog, setCatalog] = useState<TestingCatalog | null>(null), [test, setTest] = useState<MemberTest | null>(null), [history, setHistory] = useState<{ rows: PromotionHistory[]; capped: boolean } | null>(null);
  const [testId, setTestId] = useState(''), [targetRank, setTargetRank] = useState(''), [newName, setNewName] = useState(''), [testDate, setTestDate] = useState(() => classDay(null));
  const [reason, setReason] = useState(''), [result, setResult] = useState('pass'), [error, setError] = useState(''), [testError, setTestError] = useState(''), [reload, setReload] = useState(0);
  const [prepared, setPrepared] = useState<PreparedMemberAction | null>(null), [busy, setBusy] = useState(false);
  const alive = useRef(true), inFlight = useRef(false); const router = useRouter();
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    const read = async (op: string) => { const a = await memberRead(op, { query: name.slice(0, 100) }, controller.signal); if (a.outcome !== 'done') throw Error(a.outcome === 'failed' ? a.code : 'BACKEND_UNAVAILABLE'); return a.result; };
    void Promise.all([read('testing_eligibility'), read('promotion_history')]).then(([eligibility, awards]) => {
      if (cancelled) return;
      const c = testingCatalogFrom(eligibility, memberId), h = promotionHistoryFrom(awards, memberId);
      if (!c || !h) { setError('HUB_RESPONSE_UNREADABLE'); return; }
      setCatalog(c); setHistory(h);
    }).catch(e => { if (!cancelled) { const code = e instanceof Error ? e.message : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); } });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, name, reload, onAuthenticationLost]);
  useEffect(() => {
    if (!testId) return;
    let cancelled = false; const controller = new AbortController();
    void memberRead('testing_roster', { testId }, controller.signal).then(a => {
      if (cancelled) return;
      if (a.outcome !== 'done') { const code = a.outcome === 'failed' ? a.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setTestError(code); return; }
      const parsed = memberTestFrom(a.result, testId); if (!parsed) setTestError('HUB_RESPONSE_UNREADABLE'); else setTest(parsed);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [testId, reload, onAuthenticationLost]);
  const current = test?.test.id === testId ? test : null;
  const registration = current?.rows.find(r => r.memberId === memberId);
  const reasonValid = !!reason.trim();
  function refresh() { setCatalog(null); setHistory(null); setTest(null); setError(''); setTestError(''); setReason(''); setReload(n => n + 1); router.refresh(); }
  function prepareRoster(remove = false) {
    if (busy || inFlight.current) return;
    if (!catalog || !reasonValid || (remove && !registration) || (!remove && !catalog.ranks.some(r => r.id === targetRank))) return;
    if (testId && (!current || current.test.state !== 'scheduled')) return;
    if (!testId && (!newName.trim() || !testDate)) return;
    if (!remove && (!catalog.member || catalog.member.openTest)) return;
    const testName = current?.test.name ?? newName.trim(), date = current?.test.date ?? testDate;
    setPrepared({ title: remove ? 'Remove student from testing roster' : 'Register student for belt testing', command: { operation: 'save_testing_roster', subjectId: memberId, payload: { testId: current?.test.id ?? null, expectedVersion: current?.test.version ?? 0, name: testName, testDate: date, add: remove ? [] : [{ memberId, targetRankId: targetRank }], removeRegistrationIds: remove && registration ? [registration.registrationId] : [], reason: reason.trim() } }, evidence: [{ label: 'Student', value: `${name} · ID ${memberId}` }, { label: 'Test', value: `${testName} · ${date}${current ? ` · ID ${current.test.id}` : ' · New test'}` }, { label: 'Target rank', value: remove ? registration!.targetRank : catalog.ranks.find(r => r.id === targetRank)!.name }, { label: 'Reason', value: reason.trim() }], effects: [remove ? 'Removes only this student’s pending registration.' : 'Adds only this student with a pending result. For a new test, creates the native test and its first registration.', 'No rank award, invoice or message is created. Odoo maintains the pending-test flag used by its eligibility jobs.'] });
  }
  function prepareResult() {
    if (busy || inFlight.current) return;
    if (!current || !registration || !reasonValid || registration.promotionId || result === registration.result) return;
    setPrepared({ title: 'Record testing result', command: { operation: 'record_test_results', subjectId: memberId, payload: { testId, expectedVersion: current.test.version, results: [{ registrationId: registration.registrationId, result }], reason: reason.trim() } }, evidence: [{ label: 'Student', value: `${name} · ID ${memberId}` }, { label: 'Test', value: current.test.name }, { label: 'Result', value: `${registration.result} → ${result}` }, { label: 'Reason', value: reason.trim() }], effects: ['Changes only this student’s registration result and moves the test into progress as required by Odoo.', 'A pass result is not a rank award. Promotion requires a separate preview and confirmation.'] });
  }
  async function preparePromotion() {
    if (!current || !registration || registration.result !== 'pass' || registration.promotionId || !reasonValid || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    const a = await memberRead('promotion_preview', { testId, registrationIds: [registration.registrationId] });
    inFlight.current = false; if (!alive.current) return; setBusy(false);
    if (a.outcome !== 'done') { const code = a.outcome === 'failed' ? a.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); return; }
    const v = a.result;
    if (v.testId !== testId || !Array.isArray(v.conflicts) || !Array.isArray(v.promotions)) { setError('HUB_RESPONSE_UNREADABLE'); return; }
    if (v.valid !== true || v.conflicts.length) { setError(v.conflicts.filter(object).map(c => string(c.problem) ? c.problem : 'Promotion needs review').join('; ') || 'PROMOTION_REVIEW_REQUIRED'); return; }
    const row = v.promotions[0];
    if (v.promotions.length !== 1 || !object(row) || row.memberId !== memberId || row.registrationId !== registration.registrationId || !string(row.to) || !(row.from === null || string(row.from)) || !nonnegative(v.version) || !string(v.reviewToken) || !/^[a-f0-9]{64}$/.test(v.reviewToken)) { setError('HUB_RESPONSE_UNREADABLE'); return; }
    setPrepared({ title: 'Award passing test promotion', command: { operation: 'promote_test_results', subjectId: memberId, payload: { testId, expectedVersion: v.version, registrationIds: [registration.registrationId], reason: reason.trim(), reviewToken: v.reviewToken } }, evidence: [{ label: 'Student', value: `${name} · ID ${memberId}` }, { label: 'Test', value: current.test.name }, { label: 'Promotion', value: `${row.from ?? 'No current rank'} → ${row.to}` }, { label: 'Reason', value: reason.trim() }], effects: ['Creates the native rank award only for this student and links it to the passed test registration. Odoo rechecks the reviewed promotion plan.', 'No invoice or message is created. Odoo may mark the shared test complete once all its registration results are resolved.'] });
  }
  function reverse(award: PromotionHistory) {
    if (busy || inFlight.current) return;
    if (!reasonValid || !award.latest || award.reversed) return;
    setPrepared({ title: 'Reverse latest rank award', command: { operation: 'reverse_promotion', subjectId: memberId, payload: { rankHistoryId: award.id, expectedVersion: award.memberVersion, reason: reason.trim() } }, evidence: [{ label: 'Student', value: `${name} · ID ${memberId}` }, { label: 'Award', value: `${award.rank} · ${award.date} · Award #${award.id}` }, { label: 'Reason', value: reason.trim() }], effects: ['Deactivates the latest current award and recomputes the student’s recorded rank from remaining active history.', 'The original award and its reversal evidence remain in Odoo. This is a rank correction, not a deletion of history.'] });
  }
  if (prepared) return <><MemberActionDialog prepared={prepared} onAuthenticationLost={onAuthenticationLost} onClose={() => { setPrepared(null); refresh(); }} onSaved={v => { if (string(v.testId)) setTestId(v.testId); router.refresh(); }} /><p className="text-sm text-(--crm-muted)">Testing review is open. Close the receipt to reload current results.</p></>;
  return <section className="roster-scope rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5" aria-label="Student testing and promotions"><header className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Testing and promotions</h2><Button type="button" disabled={busy} onClick={refresh}>Refresh testing records</Button></header><p className="mt-3 text-xs muted">Actions on this page target only {name}’s registration or award. A test may also contain other students. Passing, awarding a rank, and reversing an award are separate steps.</p>
    {error && <p role="alert" className="mt-4 text-sm">{error === 'FORBIDDEN' ? 'Testing records require owner or manager access.' : explainHubError(error)}</p>}
    {!catalog && !error && <p role="status" className="mt-4 text-sm">Loading testing records…</p>}
    {catalog && <div className="mt-4 space-y-4">
      {catalog.capped && <p className="text-xs muted">A source limit was reached; older tests or eligibility rows may be omitted.</p>}
      {!catalog.member && <p className="text-sm">No eligibility row for this exact student ID was returned. New registrations stay unavailable until the source supplies it.</p>}
      {catalog.member?.openTest && <p className="text-sm">Pending test: {catalog.member.openTest.name} · <button type="button" className="underline" onClick={() => { setTest(null); setTestError(''); setTestId(catalog.member!.openTest!.testId); }}>Open this test</button></p>}
      <Field label="Testing session"><Select value={testId} disabled={busy} onChange={e => { setTestId(e.target.value); setTest(null); setTestError(''); }}><option value="">Create a new test for this student</option>{catalog.tests.map(t => <option key={t.id} value={t.id}>{t.name} · {t.date} · {t.state} · {t.count} registrations</option>)}</Select></Field>
      {testId && !current && !testError && <p role="status" className="text-sm">Loading selected test roster…</p>}{testError && <p role="alert" className="text-sm">{explainHubError(testError)}</p>}
      {current && <div className="space-y-2 text-sm"><p className="font-semibold">{current.test.name} · {current.test.date} · {current.test.state}</p><p>{current.school} · {current.rows.length} registrations in this test.</p>{registration ? <p>{registration.currentRank ?? 'No current rank'} → {registration.targetRank} · {registration.result}{registration.promotionId ? ` · Award #${registration.promotionId}` : ''}</p> : <p>This student is not on this test roster.</p>}</div>}
      {!testId && <><Field label="New test name"><Input value={newName} maxLength={200} disabled={busy} onChange={e => setNewName(e.target.value)} /></Field><Field label="Test date"><Input type="date" value={testDate} disabled={busy} onChange={e => setTestDate(e.target.value)} /></Field></>}
      {(!testId || (current?.test.state === 'scheduled' && !registration)) && <Field label="Target rank"><Select value={targetRank} disabled={busy} onChange={e => setTargetRank(e.target.value)}><option value="">Choose a configured target rank</option>{catalog.ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></Field>}
      <Field label="Staff reason / assessment evidence"><Textarea value={reason} maxLength={500} disabled={busy} onChange={e => setReason(e.target.value)} /></Field>
      {(!testId || (current?.test.state === 'scheduled' && !registration)) && <Button type="button" disabled={busy || !reasonValid || !targetRank || !catalog.member || !!catalog.member.openTest || (!testId && (!newName.trim() || !testDate))} onClick={() => prepareRoster()}>Review testing registration</Button>}
      {current?.test.state === 'scheduled' && registration?.result === 'pending' && !registration.promotionId && <Button type="button" disabled={busy || !reasonValid} onClick={() => prepareRoster(true)}>Review removing this pending registration</Button>}
      {current && registration && ['scheduled', 'in_progress'].includes(current.test.state) && !registration.promotionId && <><Field label="Recorded assessment result"><Select value={result} disabled={busy} onChange={e => setResult(e.target.value)}>{['pending', 'pass', 'fail', 'withdrew'].map(r => <option key={r} value={r}>{r}</option>)}</Select></Field><Button type="button" disabled={busy || !reasonValid || result === registration.result} onClick={prepareResult}>Review result change</Button></>}
      {registration?.result === 'pass' && !registration.promotionId && <Button type="button" disabled={busy || !reasonValid} onClick={() => void preparePromotion()}>Preview this student’s promotion</Button>}
      <h3 className="border-t border-(--crm-line) pt-4 font-semibold">Awards and reversals</h3>{history?.capped && <p className="text-xs muted">The award history is capped; older awards may be omitted.</p>}{history?.rows.length === 0 && <p className="text-sm muted">No awards for this exact student were included in the source history.</p>}<ol className="space-y-3">{history?.rows.map(a => <li key={a.id} className="rounded-lg border border-(--crm-line) p-3 text-sm"><p className="font-semibold">{a.rank} · {a.stripes} stripes · {a.date}{a.reversed ? ' · Reversed' : ''}</p><p>{a.source} · Award #{a.id}</p>{a.reversed && <p>Reversed by {a.reversedBy ?? 'Actor not supplied'} · {a.reversalReason ?? 'Reason not supplied'}</p>}{a.latest && !a.reversed && <Button type="button" disabled={busy || !reasonValid} onClick={() => reverse(a)}>Review reversal of latest award</Button>}</li>)}</ol>
    </div>}
  </section>;
}
