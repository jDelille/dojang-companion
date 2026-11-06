'use client';

import { useEffect, useState } from 'react';
import type { Member } from '@/domain/member';
import { memberExtraAllowed } from '@/domain/memberToolContext';
import { memberRead } from '@/integrations/memberActions';
import { SIGN_IN_CODES } from '@/integrations/hub';
import MemberDialog from './memberDialog';

/*
   Message (msg.png): pick a recipient from this student's household, write a
   message, preview it. Recipients are the household guardians Odoo returns,
   plus the student. Nothing is sent: starting a new outbound message isn't
   connected yet (replies to inbound messages are sent from Inbox).
*/

type Recipient = { id: string; label: string };

type GuardianRow = { id: string; name: string; primary: boolean };

function guardiansFrom(raw: Record<string, unknown>): GuardianRow[] {
  const data = raw.data as { householdGuardians?: GuardianRow[] } | undefined;
  const guardians = data?.householdGuardians ?? [];
  // Primary guardian first
  return [...guardians].sort((a, b) => Number(b.primary) - Number(a.primary));
}

export default function MemberMessageDialog({ member, onClose, onAuthenticationLost }: {
  member: Member;
  onClose: () => void;
  onAuthenticationLost: () => void;
}) {
  const student: Recipient = { id: `member:${member.id}`, label: `${member.name} · Student` };

  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [guardiansUnavailable, setGuardiansUnavailable] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [draft, setDraft] = useState('');
  const [previewing, setPreviewing] = useState(false);

  // Read the household guardians for the recipient list
  useEffect(() => {
    const controller = new AbortController();
    void memberRead('member_workspace', { memberId: member.id, section: 'family' }, controller.signal).then(answer => {
      if (controller.signal.aborted) return;
      if (answer.outcome === 'failed' && SIGN_IN_CODES.includes(answer.code)) { onAuthenticationLost(); return; }

      let guardians: Recipient[] = [];
      if (answer.outcome === 'done' && memberExtraAllowed('guardian', answer.result, member.id) && answer.result.unavailable === undefined) {
        guardians = guardiansFrom(answer.result).map(g => ({ id: `guardian:${g.id}`, label: `${g.name} · Guardian` }));
      } else {
        setGuardiansUnavailable(true);
      }

      const list = [...guardians, { id: `member:${member.id}`, label: `${member.name} · Student` }];
      setRecipients(list);
      setRecipientId(list[0].id);
    });
    return () => controller.abort();
  }, [member.id, member.name, onAuthenticationLost]);

  const recipient = recipients?.find(r => r.id === recipientId) ?? student;
  const title = member.householdName ? `Contact the ${member.householdName}` : `Contact ${member.name}`;

  return (
    <MemberDialog
      eyebrow="Message"
      title={title}
      description="The recipient and member context stay attached to this message."
      onClose={onClose}
      actions={
        <>
          <button type="button" className="app-dialog-button" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="app-dialog-button app-dialog-button-primary"
            disabled={!draft.trim() || !recipients}
            onClick={() => setPreviewing(true)}
          >
            Preview message
          </button>
        </>
      }
    >
      <label className="app-dialog-field">
        <span>Recipient</span>
        <select
          className="app-dialog-input app-dialog-select"
          value={recipientId}
          disabled={!recipients}
          onChange={event => { setRecipientId(event.target.value); setPreviewing(false); }}
        >
          {!recipients && <option value="">Loading recipients…</option>}
          {recipients?.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </label>
      {guardiansUnavailable && <p className="app-dialog-note">Household guardians couldn&apos;t be loaded, so only the student is listed.</p>}

      <label className="app-dialog-field">
        <span>Message</span>
        <textarea
          className="app-dialog-input"
          rows={4}
          value={draft}
          placeholder={`Write a message to ${recipient.label.split(' · ')[0]}`}
          onChange={event => { setDraft(event.target.value); setPreviewing(false); }}
        />
      </label>

      {previewing && (
        <div className="app-dialog-preview" role="status">
          <p className="app-dialog-eyebrow">Preview · To {recipient.label}</p>
          <p className="mt-2 whitespace-pre-wrap break-words">{draft}</p>
          <p className="app-dialog-note">Not sent. Starting a new message isn&apos;t connected yet; replies to inbound messages are sent from Inbox.</p>
        </div>
      )}
    </MemberDialog>
  );
}
