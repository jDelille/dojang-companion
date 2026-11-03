'use client';
import { useEffect, useState } from 'react';
import { memberRead } from '@/integrations/memberActions';
import { onboardingFrom, type Onboarding } from '@/domain/memberCompletion';
import { explainHubError } from '@/domain/hubAction';
import type { MemberTool } from './memberTools';
export default function MemberOnboarding({ memberId, onAction, onTab, onAuthenticationLost }: { memberId: string; onAction: (tool: MemberTool) => void; onTab: (tab: string) => void; onAuthenticationLost: () => void }) {
  const [data, setData] = useState<Onboarding | null>(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    void memberRead('member_onboarding', { memberId }, controller.signal).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') { const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); return; }
      const parsed = onboardingFrom(answer.result, memberId);
      if (!parsed) setError('HUB_RESPONSE_UNREADABLE'); else setData(parsed);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, reload, onAuthenticationLost]);
  const actions: Record<string, () => void> = { profile: () => onAction('edit'), contact: () => onAction('edit'), guardian: () => onTab('Family'), waiver: () => onAction('waiver'), membership: () => onTab('Membership'), class: () => onTab('Bookings'), consent: () => onAction('consent'), kiosk: () => onAction('pin') };
  return <section className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5" aria-label="Student onboarding checklist"><header className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Student setup</h2><button type="button" className="text-[12px] underline" onClick={() => { setData(null); setError(''); setReload(n => n + 1); }}>Refresh checklist</button></header>
    {error ? <p className="mt-3 text-sm">{error === 'FORBIDDEN' ? 'The student setup checklist is restricted by your Odoo role.' : explainHubError(error)}</p> : !data ? <p role="status" className="mt-3 text-sm">Checking the student’s Odoo setup…</p> : <><p className="mt-3 text-sm text-(--crm-text-secondary)">{data.done} of {data.total} setup checks satisfied</p><ul className="mt-3 divide-y divide-(--crm-line)">{data.items.map(item => <li key={item.key} className="flex items-start justify-between gap-3 py-3 text-[13px]"><div><p className="font-semibold">{item.done ? '✓' : '○'} {item.label}</p><p className="mt-1 text-(--crm-text-secondary)">{item.detail}</p></div>{actions[item.key] && <button type="button" className="shrink-0 text-[12px] font-semibold underline" onClick={actions[item.key]}>Review</button>}</li>)}</ul><p className="mt-3 text-[11px] text-(--crm-muted)">These are Odoo’s setup checks, not a complete assessment of legal consent, signing authority, payment status or training eligibility.</p></>}
  </section>;
}
