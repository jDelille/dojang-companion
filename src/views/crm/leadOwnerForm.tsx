'use client';

// Roster owner-selector/modal pattern, backed by Hub assign_lead.
import { useEffect, useRef, useState } from 'react';
import type { CrmAssignee, Lead } from '@/domain/lead';
import type { AssignLeadPayload, AssignLeadResult } from '@/domain/crmWrites';
import { explainHubError, newRequestKey } from '@/domain/hubAction';
import { assignLead } from '@/integrations/crmWrites';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Select } from '@/templates/roster/components/ui/form';
import { Modal } from '@/templates/roster/components/ui/overlay';
import '@/templates/roster/roster.css';

type Status = 'editing' | 'review' | 'pending' | 'uncertain' | 'failed';
export default function LeadOwnerForm({ lead, assignees, onClose, onReload, onSaved }: {
  lead: Lead; assignees: CrmAssignee[]; onClose: () => void; onReload: () => void; onSaved: (result: AssignLeadResult) => void;
}) {
  const [original] = useState(lead);
  const [ownerId, setOwnerId] = useState('');
  const [status, setStatus] = useState<Status>('editing');
  const [error, setError] = useState('');
  const frozen = useRef<{ payload: AssignLeadPayload; key: string } | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const resetSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const selected = assignees.find(a => a.id === ownerId);
  const locked = status === 'pending' || status === 'uncertain';
  const staleRecord = lead.id !== original.id || lead.version !== original.version || error === 'VERSION_CONFLICT';
  const mustReload = staleRecord || error === 'ODOO_ASSIGNMENT_FORBIDDEN';
  const valid = !!selected && ownerId !== original.ownerId;
  function close() { if (!inFlight.current && !locked) onClose(); }
  async function save() {
    if (inFlight.current || (!frozen.current && (!valid || mustReload || status !== 'review'))) return;
    frozen.current ??= { payload: { leadId: original.id, expectedVersion: original.version, ownerId }, key: newRequestKey() };
    inFlight.current = true;
    setStatus('pending'); setError('');
    const answer = await assignLead(frozen.current.payload, frozen.current.key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === 'notConfirmed') { setStatus('uncertain'); return; }
    frozen.current = null;
    if (answer.outcome === 'failed') {
      if (['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(answer.code)) {
        resetSession(); markSignedOut(); onClose(); onReload(); return;
      }
      setError(answer.code); setStatus('failed'); return;
    }
    onSaved(answer.result);
  }
  function submit() {
    if (status === 'review' || status === 'uncertain') { void save(); return; }
    if (valid && !mustReload) { setError(''); setStatus('review'); }
  }
  return <div className="roster-scope"><Modal open title="Assign lead owner" onClose={close} onSubmit={submit} width="sm"
    description={`Choose an authorized owner for ${original.name}. This changes the lead owner only; existing tasks retain their owners.`}
    footer={<>
      <Button type="button" variant="ghost" disabled={locked} onClick={close}>Cancel</Button>
      {status === 'review' && <Button type="button" onClick={() => setStatus('editing')}>Back to edit</Button>}
      {mustReload && !locked ? <Button type="button" onClick={() => { onClose(); onReload(); }}>Reload record and discard draft</Button> :
        <Button type="submit" variant="primary" disabled={status === 'pending' || (!locked && (!valid || mustReload))}>
          {status === 'pending' ? 'Waiting for Odoo…' : status === 'uncertain' ? 'Retry same assignment' : status === 'review' ? 'Assign owner' : 'Review assignment'}
        </Button>}
    </>}>
    {status === 'editing' || status === 'failed' ? <div className="space-y-4">
      <p className="text-sm muted">Current owner: {original.owner}</p>
      <Field label="New owner"><Select required value={ownerId} disabled={mustReload} onChange={e => setOwnerId(e.target.value)}>
        <option value="">Choose an owner</option>
        {assignees.map(a => <option key={a.id} value={a.id} disabled={a.id === original.ownerId}>{a.name}{a.id === original.ownerId ? ' (current)' : ''}</option>)}
      </Select></Field>
    </div> : <dl className="space-y-2 text-sm"><dt className="font-semibold">Lead owner</dt>
      <dd>{original.owner} <span aria-hidden="true">→</span><span className="sr-only">changes to</span> <strong>{selected?.name ?? 'Selected owner'}</strong></dd>
      <dd className="muted">Stage, contact fields and existing task assignments are not changed by this action.</dd>
    </dl>}
    {error && <p role="alert" className="mt-4 text-sm text-(--crm-warning)">{explainHubError(error)}</p>}
    {staleRecord && !locked && <p role="alert" className="mt-4 text-sm text-(--crm-warning)">The lead changed. Reload it before assigning an owner.</p>}
    {status === 'uncertain' && <p role="status" className="mt-4 text-sm text-(--crm-warning)">Assignment not confirmed. Retry preserves the same owner, version and request key. Do not start another assignment.</p>}
  </Modal></div>;
}
