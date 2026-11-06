'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Member } from '@/domain/member';
import { memberToolContextFrom, type MemberToolContext } from '@/domain/memberToolContext';
import { explainHubError } from '@/domain/hubAction';
import { memberRead } from '@/integrations/memberActions';
import { SIGN_IN_CODES } from '@/integrations/hub';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import MemberDialog from './memberDialog';
import MemberActionDialog, { type PreparedMemberAction } from './memberActionDialog';

/*
   Edit (edit-modal.png): "Profile & training". Odoo's update_member accepts
   only name, email and phone, so those are the editable fields. Program,
   primary instructor and tags are shown but can't be changed through the Hub
   yet. "Save changes" opens the same review-and-confirm step as before.
*/

type ContactField = 'name' | 'email' | 'phone';

const FIELD_LABELS: Record<ContactField, string> = { name: 'Full name', email: 'Email', phone: 'Phone' };
const FIELD_TYPES: Record<ContactField, string> = { name: 'text', email: 'email', phone: 'tel' };

export default function MemberEditDialog({ member, onClose, onAskAI, onAuthenticationLost }: {
  member: Member;
  onClose: () => void;
  onAskAI: () => void;
  onAuthenticationLost: () => void;
}) {
  const router = useRouter();
  const resetSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();

  const [record, setRecord] = useState<MemberToolContext | null>(null);
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState<PreparedMemberAction | null>(null);
  const [reload, setReload] = useState(0);

  // Read the current Odoo record (versions and edit permissions)
  useEffect(() => {
    const controller = new AbortController();
    void memberRead('member_details', { memberId: member.id }, controller.signal).then(answer => {
      if (controller.signal.aborted) return;
      if (answer.outcome === 'failed') {
        if (SIGN_IN_CODES.includes(answer.code)) {
          resetSession();
          markSignedOut();
          onAuthenticationLost();
          return;
        }
        setError(answer.code);
        return;
      }
      if (answer.outcome !== 'done') { setError('BACKEND_UNAVAILABLE'); return; }
      const parsed = memberToolContextFrom(answer.result, member.id);
      if (!parsed) { setError('HUB_RESPONSE_UNREADABLE'); return; }
      setRecord(parsed);
    });
    return () => controller.abort();
  }, [member.id, reload, resetSession, markSignedOut, onAuthenticationLost]);

  const canSave = !!record && record.canEdit && record.canEditContact;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record || !canSave) return;
    const form = new FormData(event.currentTarget);

    // Only the fields that actually changed
    const changes: Record<string, string> = {};
    for (const field of ['name', 'email', 'phone'] as const) {
      const value = String(form.get(field) ?? '').trim();
      if (value !== (record.member[field] ?? '')) changes[field] = value;
    }
    if (Object.keys(changes).length === 0) { setError('NO_CHANGES'); return; }

    setPrepared({
      command: {
        operation: 'update_member',
        payload: { memberId: member.id, expectedVersion: record.member.version, expectedPartnerVersion: record.member.partnerVersion, changes },
      },
      title: 'Edit student',
      effects: ['Updates only the reviewed contact fields on the native Odoo profile. Membership state, rank and billing are unchanged.'],
      evidence: [
        { label: 'Student', value: `${record.member.name} · ID ${member.id}` },
        ...Object.entries(changes).map(([field, value]) => ({
          label: FIELD_LABELS[field as ContactField],
          value: `${record.member[field as ContactField] || '(blank)'} → ${value || '(clear field)'}`,
        })),
      ],
    });
  }

  // Review and confirm (the existing governed step)
  if (prepared) {
    return (
      <MemberActionDialog
        prepared={prepared}
        onAuthenticationLost={onAuthenticationLost}
        onSaved={() => router.refresh()}
        onClose={onClose}
      />
    );
  }

  const locked = [
    ['Program', member.training?.program],
    ['Primary instructor', member.training?.primaryInstructor],
  ];

  return (
    <MemberDialog
      eyebrow="Edit member"
      title="Profile & training"
      description="Only this task is active; the workspace remains underneath."
      onClose={onClose}
    >
      {error && (
        <div role="alert" className="app-dialog-note">
          <p>{explainHubError(error)} · {error}</p>
          {error !== 'NO_CHANGES' && (
            <button type="button" className="app-dialog-button mt-3" onClick={() => { setError(''); setRecord(null); setReload(n => n + 1); }}>
              Try again
            </button>
          )}
        </div>
      )}

      {!record && !error && <p role="status" className="app-dialog-note">Loading the current Odoo record…</p>}

      {record && (
        <form id="member-edit-form" onSubmit={save} onChange={() => { if (error === 'NO_CHANGES') setError(''); }} className="grid gap-4">
          <div className="app-dialog-grid">
            {(['name', 'email', 'phone'] as const).map(field => (
              <label key={field} className="app-dialog-field">
                <span>{FIELD_LABELS[field]}</span>
                <input
                  name={field}
                  type={FIELD_TYPES[field]}
                  className="app-dialog-input"
                  defaultValue={record.member[field] ?? ''}
                  required={field === 'name'}
                  maxLength={200}
                  disabled={!canSave}
                />
              </label>
            ))}
            {locked.map(([label, value]) => (
              <label key={label} className="app-dialog-field">
                <span>{label}</span>
                <input className="app-dialog-input" value={value ?? 'Not recorded'} disabled readOnly title="Not editable through Odoo yet" />
              </label>
            ))}
          </div>

          <label className="app-dialog-field">
            <span>Tags</span>
            <div className="app-dialog-input app-dialog-tags" aria-disabled="true">Not editable through Odoo yet</div>
          </label>

          <section className="app-dialog-checks" aria-label="Odoo checks">
            <p className="app-dialog-eyebrow">Odoo checks</p>
            <ul>
              <li>{record.canEdit ? '✓' : '✕'} {record.canEdit ? 'You can manage this student' : 'Your role can’t manage this student'}</li>
              <li>{record.canEditContact ? '✓' : '✕'} {record.canEditContact ? 'Contact details can be edited here' : 'Contact is shared; review it in Odoo'}</li>
            </ul>
          </section>
        </form>
      )}

      <footer className="app-dialog-actions">
        <button type="button" className="app-dialog-button" onClick={onClose}>Cancel</button>
        <button type="submit" form="member-edit-form" className="app-dialog-button app-dialog-button-primary" disabled={!canSave}>
          Save changes
        </button>
        <button type="button" className="app-dialog-button" onClick={onAskAI}>Ask AI to prepare edit</button>
      </footer>
    </MemberDialog>
  );
}
