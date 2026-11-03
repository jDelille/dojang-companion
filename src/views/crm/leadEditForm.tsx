'use client';

// Roster's lead/contact edit-modal pattern, using its migrated form components.
// Business action: Hub update_lead, not the vendor's lead PATCH route.
import { useEffect, useRef, useState } from 'react';
import type { Lead } from '@/domain/lead';
import { changedLeadFields, isUpdateLeadPayload, type LeadContactFields, type UpdateLeadPayload, type UpdateLeadResult } from '@/domain/crmWrites';
import { explainHubError, newRequestKey } from '@/domain/hubAction';
import { updateLead } from '@/integrations/crmWrites';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import { Button } from '@/templates/roster/components/ui/button';
import { Field, Input } from '@/templates/roster/components/ui/form';
import { Modal } from '@/templates/roster/components/ui/overlay';
import '@/templates/roster/roster.css';

const LABELS = { name: 'Lead name', contact: 'Contact name', email: 'Email', phone: 'Phone' };
type Status = 'editing' | 'review' | 'pending' | 'uncertain' | 'failed';
export default function LeadEditForm({ lead, onClose, onSaved, onReload }: {
  lead: Lead; onClose: () => void; onSaved: (result: UpdateLeadResult) => void; onReload: () => void;
}) {
  const [original] = useState(lead);
  const [form, setForm] = useState<LeadContactFields>({ name: lead.name, contact: lead.contact, email: lead.email, phone: lead.phone });
  const [status, setStatus] = useState<Status>('editing');
  const [error, setError] = useState('');
  const attempt = useRef<{ key: string; payload: UpdateLeadPayload } | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const resetSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const changes = changedLeadFields(original, form);
  const payload: UpdateLeadPayload = { leadId: original.id, expectedVersion: original.version, changes };
  const locked = status === 'pending' || status === 'uncertain';
  const changedRecord = lead.id !== original.id || lead.version !== original.version;
  const mustReload = changedRecord || error === 'VERSION_CONFLICT' || error === 'SHARED_CONTACT_REVIEW_REQUIRED';
  const valid = isUpdateLeadPayload(payload);
  const canEditContact = original.canEditContact === true;

  function close() { if (!inFlight.current && !locked) onClose(); }
  async function save() {
    if (inFlight.current || (!attempt.current && (!valid || mustReload || status !== 'review'))) return;
    attempt.current ??= { key: newRequestKey(), payload };
    const frozen = attempt.current;
    inFlight.current = true;
    setStatus('pending');
    setError('');
    const answer = await updateLead(frozen.payload, frozen.key);
    inFlight.current = false;
    if (!mounted.current) return;
    if (answer.outcome === 'notConfirmed') { setStatus('uncertain'); return; }
    attempt.current = null;
    if (answer.outcome === 'failed') {
      if (answer.code === 'SIGN_IN_REQUIRED' || answer.code === 'UNAUTHENTICATED') {
        resetSession(); markSignedOut(); onClose(); onReload(); return;
      }
      setError(answer.code); setStatus('failed'); return;
    }
    onSaved(answer.result);
  }
  function submit() {
    if (status === 'uncertain' || status === 'review') { void save(); return; }
    if (valid && !mustReload) { setError(''); setStatus('review'); }
  }
  return <div className="roster-scope"><Modal open onClose={close} title={`Edit ${original.name}`} width="sm"
    description="Review changes before saving them to Odoo. Stage, owner, trial, membership, and billing stay unchanged. No communication is sent."
    onSubmit={submit} footer={<>
      <Button type="button" variant="ghost" disabled={locked} onClick={close}>Cancel</Button>
      {status === 'review' && <Button type="button" onClick={() => setStatus('editing')}>Back to edit</Button>}
      {mustReload && !locked ? <Button type="button" onClick={() => { onClose(); onReload(); }}>Reload record and discard draft</Button> :
        <Button type="submit" variant="primary" disabled={status === 'pending' || (!locked && (!valid || mustReload))}>
          {status === 'pending' ? 'Waiting for Odoo…' : status === 'uncertain' ? 'Retry same save' : status === 'review' ? 'Save changes' : 'Review changes'}
        </Button>}
    </>}>
    {status === 'editing' || status === 'failed' ? <fieldset disabled={locked || mustReload} className="space-y-4">
      {(Object.keys(LABELS) as (keyof LeadContactFields)[]).map(key => <Field key={key} label={LABELS[key]}
        required={key === 'name'} hint={key === 'name' || canEditContact ? undefined : original.canEditContact === false
          ? 'Shared contact: review changes in Odoo.' : 'Contact editing permission was not provided by this read.'}>
        <Input type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} maxLength={200}
          required={key === 'name'} disabled={key !== 'name' && !canEditContact} value={form[key]}
          onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} />
      </Field>)}
    </fieldset> : <dl className="space-y-3 text-sm">
      {Object.entries(changes).map(([key, value]) => <div key={key} className="border-b border-(--crm-line) pb-3">
        <dt className="font-semibold">{LABELS[key as keyof LeadContactFields]}</dt>
        <dd className="mt-1 break-words text-(--crm-text-secondary)"><span>{original[key as keyof LeadContactFields] || 'Empty'}</span>
          <span aria-hidden="true"> → </span><span className="sr-only"> changes to </span><strong className="text-(--crm-text)">{value || 'Empty'}</strong></dd>
      </div>)}
    </dl>}
    {error && <p role="alert" className="mt-4 text-sm text-(--crm-warning)">{explainHubError(error)}</p>}
    {changedRecord && !locked && <p role="alert" className="mt-4 text-sm text-(--crm-warning)">This record changed while the editor was open. Reload it before saving.</p>}
    {status === 'uncertain' && <p role="status" className="mt-4 text-sm text-(--crm-warning)">Save not confirmed. It may have reached Odoo. Retry keeps the exact changes, version, and request key; do not start another edit.</p>}
  </Modal></div>;
}
