'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { memberRead } from '@/integrations/memberActions';
import { object, recordId, nonnegative, string } from '@/domain/memberActions';
import { explainHubError } from '@/domain/hubAction';
import { Modal } from '@/templates/roster/components/ui/overlay';
import { Button } from '@/templates/roster/components/ui/button';
import { Input, Field, Textarea } from '@/templates/roster/components/ui/form';
import MemberActionDialog, { type PreparedMemberAction } from './memberActionDialog';
import { TimeLabel } from '@/views/crm/localTime';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
type Archived = { id: string; name: string; version: number; memberNumber: string; archivedAt: string | null; reason: string | null };
export default function ArchivedStudents({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState(''), [search, setSearch] = useState(''), [reload, setReload] = useState(0);
  const [rows, setRows] = useState<Archived[] | null>(null), [more, setMore] = useState(false), [error, setError] = useState('');
  const [selected, setSelected] = useState<Archived | null>(null), [reason, setReason] = useState(''), [prepared, setPrepared] = useState<PreparedMemberAction | null>(null);
  const router = useRouter(), reset = useStaffSessionReset(), signedOut = useMarkSignedOut();
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    void memberRead('archived_members', { query: search }, controller.signal).then(answer => {
      if (cancelled) return;
      if (answer.outcome !== 'done') { setError(answer.outcome === 'failed' ? answer.code : 'BACKEND_UNAVAILABLE'); return; }
      const v = answer.result;
      if (!Array.isArray(v.members) || v.members.length > 50 || typeof v.more !== 'boolean') { setError('HUB_RESPONSE_UNREADABLE'); return; }
      const result: Archived[] = [];
      for (const m of v.members) {
        if (!object(m) || !recordId(m.id) || !string(m.name) || !nonnegative(m.version) || !string(m.memberNumber) || !(m.archivedAt === null || (string(m.archivedAt) && Number.isFinite(Date.parse(m.archivedAt)))) || !(m.reason === null || string(m.reason))) { setError('HUB_RESPONSE_UNREADABLE'); return; }
        result.push({ id: m.id, name: m.name, version: m.version, memberNumber: m.memberNumber, archivedAt: m.archivedAt, reason: m.reason });
      }
      setRows(result); setMore(v.more);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [search, reload]);
  useEffect(() => { if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(error)) { reset(); signedOut(); onClose(); } }, [error, reset, signedOut, onClose]);
  function refresh() { setRows(null); setSelected(null); setReason(''); setError(''); setSearch(query.trim()); setReload(n => n + 1); }
  if (prepared) return <MemberActionDialog prepared={prepared} onClose={() => { setPrepared(null); refresh(); }} onSaved={() => router.refresh()} />;
  return <div className="roster-scope"><Modal open onClose={onClose} title="Archived students" width="lg" footer={<Button type="button" onClick={onClose}>Close</Button>}>
    <div className="flex items-end gap-2"><div className="min-w-0 flex-1"><Field label="Find archived student"><Input value={query} maxLength={100} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); refresh(); } }} /></Field></div><Button type="button" onClick={refresh}>Search / reload</Button></div>
    {error && <p role="alert" className="mt-4 text-sm">{explainHubError(error)}</p>}{!rows && !error && <p role="status" className="mt-4">Loading archived profiles…</p>}
    {rows && <><p className="mt-3 text-xs muted">{rows.length} archived profiles in this read{more ? ' · More exist; refine your search' : ''}.</p><ul className="mt-4 space-y-3">{rows.map(m => <li key={m.id} className="rounded-lg border border-(--crm-line) p-3 text-sm"><p className="font-semibold">{m.name} · {m.memberNumber || `ID ${m.id}`}</p>{m.archivedAt && <p>Last profile update: <TimeLabel iso={m.archivedAt} /></p>}{m.reason && <p className="mt-1 whitespace-pre-wrap">Archive reason: {m.reason}</p>}<Button type="button" onClick={() => setSelected(m)}>Restore this profile</Button></li>)}</ul></>}
    {selected && <section className="mt-5 space-y-3 border-t border-(--crm-line) pt-4"><h3 className="font-semibold">Restore {selected.name}</h3><Field label="Reason for restoration"><Textarea value={reason} maxLength={500} onChange={e => setReason(e.target.value)} /></Field><Button type="button" disabled={!reason.trim()} onClick={() => setPrepared({ title: 'Restore archived student', command: { operation: 'restore_member', payload: { memberId: selected.id, expectedVersion: selected.version, reason: reason.trim() } }, evidence: [{ label: 'Student', value: `${selected.name} · ID ${selected.id}` }, { label: 'Reason', value: reason.trim() }], effects: ['Restores the existing native profile. Previously cancelled class bookings are not restored. Membership, rank and billing history are preserved.'] })}>Review restoration</Button></section>}
  </Modal></div>;
}
