'use client';
import { useEffect, useState } from 'react';
import { memberRead } from '@/integrations/memberActions';
import { object, recordId, nonnegative, string } from '@/domain/memberActions';
import { explainHubError } from '@/domain/hubAction';
export default function TestingEligibility({ memberId, name, onAuthenticationLost }: { memberId: string; name: string; onAuthenticationLost: () => void }) {
  const [row, setRow] = useState<Record<string, unknown> | null>(null), [error, setError] = useState(''), [empty, setEmpty] = useState(false);
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    void memberRead('testing_eligibility', { query: name.slice(0, 100) }, controller.signal).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') { const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); return; }
      const result = answer.result;
      if (!Array.isArray(result.rows) || result.rows.length > 500 || !result.rows.every(object)) { setError('HUB_RESPONSE_UNREADABLE'); return; }
      const matches = result.rows.filter(r => r.memberId === memberId);
      if (matches.length === 0) { setEmpty(true); return; }
      const r = matches[0];
      if (matches.length !== 1 || !nonnegative(r.attended) || !(r.threshold === null || nonnegative(r.threshold)) || !string(r.status) || !['top_rank', 'no_threshold', 'eligible', 'not_yet'].includes(r.status)
        || !(r.nextRank === null || (object(r.nextRank) && recordId(r.nextRank.id) && string(r.nextRank.name)))) { setError('HUB_RESPONSE_UNREADABLE'); return; }
      setRow(r);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, name, onAuthenticationLost]);
  return <section className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5"><h2 className="font-bold">Testing attendance eligibility</h2>
    {error ? <p className="mt-3 text-sm">{error === 'FORBIDDEN' ? 'This read is restricted by your Odoo role.' : explainHubError(error)}</p> : empty ? <p className="mt-3 text-sm">No eligibility row for this exact student ID was returned in the bounded source read.</p> : !row ? <p role="status" className="mt-3 text-sm">Loading Odoo’s attendance-threshold evidence…</p> : <div className="mt-3 space-y-2 text-sm"><p>Attended since last rank: {String(row.attended)}</p><p>Next rank: {object(row.nextRank) ? String(row.nextRank.name) : 'No next rank returned'}</p><p>Required attendance: {row.threshold === null ? 'No threshold configured' : String(row.threshold)}</p><p className="font-semibold">{row.status === 'eligible' ? 'Configured attendance threshold met' : row.status === 'not_yet' ? 'Attendance threshold not met yet' : row.status === 'top_rank' ? 'No next rank configured' : 'Attendance-based eligibility is not configured'}</p></div>}
    <p className="mt-4 text-[12px] text-(--crm-muted)">This is Odoo’s attendance-threshold evidence, not a complete instructor assessment or automatic permission to promote.</p>
  </section>;
}
