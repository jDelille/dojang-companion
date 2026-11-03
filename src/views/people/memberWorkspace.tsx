'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { memberRead } from '@/integrations/memberActions';
import { object, string } from '@/domain/memberActions';
import type { WorkspaceSection } from '@/domain/memberWorkspace';
import { explainHubError } from '@/domain/hubAction';
import { TimeLabel } from '@/views/crm/localTime';
import type { MemberTool } from './memberTools';

const labels = { family: 'Family and guardians', documents: 'Documents and waiver', safety: 'Safety and emergency contacts', timeline: 'Member action timeline' };
const array = (v: unknown): Record<string, unknown>[] => Array.isArray(v) && v.every(object) ? v : [];
const button = 'text-[12px] font-bold text-(--crm-text) underline underline-offset-4';
export default function MemberWorkspace({ memberId, section, onAction, onAuthenticationLost }: { memberId: string; section: WorkspaceSection; onAction: (tool: MemberTool) => void; onAuthenticationLost: () => void }) {
  const [revealed, setRevealed] = useState(section !== 'safety');
  const [value, setValue] = useState<Record<string, unknown> | null>(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
  useEffect(() => {
    if (!revealed) return;
    let cancelled = false; const controller = new AbortController();
    void memberRead('member_workspace', { memberId, section }, controller.signal).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') { const code = answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'; if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(code)) onAuthenticationLost(); else setError(code); return; }
      if (answer.result.section !== section || answer.result.memberId !== memberId) { setError('HUB_RESPONSE_UNREADABLE'); return; }
      setValue(answer.result);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [memberId, section, revealed, reload, onAuthenticationLost]);
  const data = object(value?.data) ? value.data : null;
  return <section className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5" aria-label={labels[section]}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-(--crm-text)">{labels[section]}</h2>{revealed && <button type="button" className={button} onClick={() => { setValue(null); setError(''); setReload(n => n + 1); }}>Refresh section</button>}</header>
    {!revealed && <div className="mt-4 space-y-3 text-[13px]"><p>Safety includes sensitive medical and emergency-contact information. Odoo restricts this read to authorized management staff.</p><button type="button" className={button} onClick={() => setRevealed(true)}>View permitted safety information</button></div>}
    {revealed && !value && !error && <p role="status" className="mt-4 text-[13px]">Loading this student’s scoped Odoo records…</p>}
    {error && <p role="alert" className="mt-4 text-[13px]">{explainHubError(error)}</p>}
    {typeof value?.unavailable === 'string' && <p className="mt-4 text-[13px] text-(--crm-muted)">{value.unavailable === 'restricted' ? 'Not visible with your current Odoo role.' : 'This section was not provided by the current Hub read.'}</p>}
    {value?.capped === true && <p className="mt-3 text-[12px] text-(--crm-muted)">The returned list reached a source limit; more records may exist.</p>}
    {section === 'family' && data && <div className="mt-4 space-y-4 text-[13px]"><p>Household: {string(data.household) ? data.household : 'No household was returned'}</p>
      <div><h3 className="font-semibold">Students in this household</h3>{array(data.members).length ? <ul className="mt-2 space-y-2">{array(data.members).map(m => <li key={String(m.id)}><Link href={`/people/${String(m.id)}`} className="underline">{String(m.name)}</Link> · Student #{String(m.id)}</li>)}</ul> : <p className="mt-2 muted">No household students were returned.</p>}</div>
      <div><h3 className="font-semibold">Household guardians</h3>{array(data.householdGuardians).length ? <ul className="mt-2 space-y-2">{array(data.householdGuardians).map(g => <li key={String(g.id)}>{String(g.name)}{g.primary ? ' · Primary guardian' : ''}</li>)}</ul> : <p className="mt-2 muted">No household guardians were returned.</p>}</div>
      <div><h3 className="font-semibold">Verified messaging bindings</h3>{array(data.guardians).length ? <ul className="mt-2 space-y-2">{array(data.guardians).map(g => <li key={String(g.id)}>{String(g.name)} · {String(g.channel)} · Replies {g.allowReply ? 'permitted' : 'not permitted'}</li>)}</ul> : <p className="mt-2 muted">No verified messaging bindings were returned.</p>}</div>
      <p className="text-[12px] text-(--crm-muted)">Household membership, verified messaging bindings, communication consent, waiver signing and portal access are separate permissions.</p>
      <div className="flex flex-wrap gap-4"><button type="button" className={button} onClick={() => onAction('guardian')}>Verify messaging channel</button><button type="button" className={button} onClick={() => onAction('pin')}>Manage guardian kiosk PIN</button><button type="button" className={button} onClick={() => onAction('consent')}>Review communication consent</button></div>
    </div>}
    {section === 'documents' && data && <div className="mt-4 space-y-4 text-[13px]">
      {object(data.waiver) ? <div><p className="font-semibold">Waiver: {String(data.waiver.state)}</p>{string(data.waiver.signedBy) && <p>Signed by {data.waiver.signedBy}</p>}{string(data.waiver.signedAt) && <p><TimeLabel iso={data.waiver.signedAt} /></p>}</div> : <p>Waiver status was not provided.</p>}
      {value?.canManage === true && <button type="button" className={button} onClick={() => onAction('waiver')}>Review waiver and authorized signing</button>}
      <h3 className="font-semibold">Files attached to this student record</h3>{array(data.files).length ? <ul className="space-y-3">{array(data.files).map(f => <li key={String(f.id)}>{String(f.name)}<span className="mt-1 block text-[12px] text-(--crm-muted)">{String(f.mimeType)} · {Number(f.bytes).toLocaleString()} bytes · Attachment #{String(f.id)}</span></li>)}</ul> : <p className="muted">No file metadata was returned.</p>}
      <p className="text-[12px] text-(--crm-muted)">This contract supplies file metadata. It does not supply authorized download URLs or an upload command.</p>
    </div>}
    {section === 'safety' && data && <div className="mt-4 space-y-4 text-[13px]"><button type="button" className={button} onClick={() => { setRevealed(false); setValue(null); }}>Hide safety information</button><dl className="space-y-3">{[['Allergies', data.allergies], ['Medical notes', data.medicalNotes], ['Emergency note', data.emergencyNote]].map(([label, text]) => <div key={String(label)}><dt className="font-semibold">{String(label)}</dt><dd className="mt-1 whitespace-pre-wrap">{string(text) ? text : 'No value was returned for this field'}</dd></div>)}</dl><h3 className="font-semibold">Emergency contacts</h3>{array(data.contacts).length ? <ul className="space-y-3">{array(data.contacts).map(c => <li key={String(c.id)}>{String(c.name)}{c.primary ? ' · Primary' : ''}<p>{String(c.relationship ?? 'Relationship not supplied')} · {String(c.phone ?? 'Phone not supplied')}</p></li>)}</ul> : <p>No emergency contacts were returned.</p>}<p className="text-[12px] text-(--crm-muted)">Safety editing is not exposed by the current Hub contract. These values are not medical guidance.</p></div>}
    {section === 'timeline' && Array.isArray(value?.data) && <div className="mt-4 text-[13px]">{value.data.length ? <ol className="divide-y divide-(--crm-line)">{array(value.data).map(a => <li key={String(a.id)} className="space-y-1 py-3"><p className="font-semibold">{String(a.action).replaceAll('_', ' ')}</p><p className="text-(--crm-text-secondary)">{String(a.actor)}{string(a.at) ? <> · <TimeLabel iso={a.at} /></> : ''}</p><p className="text-[11px] text-(--crm-muted)">Receipt #{String(a.id)}{a.sessionId ? ` · Class #${String(a.sessionId)}` : ''}</p></li>)}</ol> : <p>No member-linked Hub actions were included in this read.</p>}<p className="mt-4 text-[12px] text-(--crm-muted)">This is the authorized Hub action window, not a complete audit of every Odoo action or every attendance entry.</p></div>}
  </section>;
}
