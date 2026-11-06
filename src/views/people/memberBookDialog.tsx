'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Member } from '@/domain/member';
import { bookableSessionsFrom, type BookableSession } from '@/domain/memberToolContext';
import { explainHubError } from '@/domain/hubAction';
import { memberRead } from '@/integrations/memberActions';
import { SIGN_IN_CODES } from '@/integrations/hub';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import MemberDialog from './memberDialog';
import MemberActionDialog, { type PreparedMemberAction } from './memberActionDialog';

/*
   Book (book.png): the upcoming classes from the Hub's scoped schedule, as a
   pick list. "Prepare booking" opens the same review-and-confirm step as
   before; Odoo checks eligibility and capacity when staff confirm.
*/

// "Today · 5:45 PM", "Sat · 10:00 AM"
function sessionTime(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const isToday = date.toDateString() === new Date().toDateString();
  const day = isToday ? 'Today' : date.toLocaleDateString([], { weekday: 'short' });
  return `${day} · ${time}`;
}

// The longer form used on the review step
function fullTime(iso: string): string {
  return new Date(iso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function MemberBookDialog({ member, onClose, onAuthenticationLost }: {
  member: Member;
  onClose: () => void;
  onAuthenticationLost: () => void;
}) {
  const router = useRouter();
  const resetSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();

  const [sessions, setSessions] = useState<BookableSession[] | null>(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [prepared, setPrepared] = useState<PreparedMemberAction | null>(null);
  const [reload, setReload] = useState(0);

  // Read the upcoming classes this staff member can book into
  useEffect(() => {
    const controller = new AbortController();
    void memberRead('context', {}, controller.signal).then(answer => {
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
      const parsed = bookableSessionsFrom(answer.result, member.id);
      if (!parsed) { setError('HUB_RESPONSE_UNREADABLE'); return; }
      setSessions(parsed);
    });
    return () => controller.abort();
  }, [member.id, reload, resetSession, markSignedOut, onAuthenticationLost]);

  const selected = sessions?.find(s => s.id === selectedId);
  const firstName = member.name.split(' ')[0];

  function prepareBooking() {
    if (!selected) return;
    setPrepared({
      command: { operation: 'book', payload: { memberId: member.id, sessionId: selected.id, expectedVersion: selected.version } },
      title: 'Book a class',
      effects: [
        'Registers the student in this class.',
        'Odoo checks membership, credits, course roster, session state and capacity. This is regular class booking; trial reservations use the lead workflow. No message is sent by this command.',
      ],
      evidence: [
        { label: 'Student', value: `${member.name} · ID ${member.id}` },
        { label: 'Class', value: `${selected.title} · ${fullTime(selected.startsAt)}` },
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

  return (
    <MemberDialog
      eyebrow="Book class"
      title={`Choose ${firstName}’s next class`}
      description="Eligible sessions from the current Odoo schedule."
      onClose={onClose}
      actions={
        <>
          <button type="button" className="app-dialog-button" onClick={onClose}>Cancel</button>
          <button type="button" className="app-dialog-button app-dialog-button-primary" disabled={!selected} onClick={prepareBooking}>
            Prepare booking
          </button>
        </>
      }
    >
      {error && (
        <div role="alert" className="app-dialog-note">
          <p>{explainHubError(error)} · {error}</p>
          <button type="button" className="app-dialog-button mt-3" onClick={() => { setError(''); setSessions(null); setReload(n => n + 1); }}>
            Try again
          </button>
        </div>
      )}

      {!sessions && !error && <p role="status" className="app-dialog-note">Loading upcoming classes…</p>}

      {sessions && sessions.length === 0 && <p className="app-dialog-note">No upcoming classes were returned.</p>}

      {sessions && sessions.length > 0 && (
        <div className="app-dialog-options" role="radiogroup" aria-label="Upcoming classes">
          {sessions.map(session => {
            const isSelected = session.id === selectedId;
            return (
              <button
                key={session.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className="app-dialog-option"
                onClick={() => setSelectedId(session.id)}
              >
                <span className="min-w-0">
                  <span className="app-dialog-option-title">{session.title}</span>
                  <span className="app-dialog-option-detail">{sessionTime(session.startsAt)}</span>
                </span>
                {session.capacity !== undefined && (
                  <span className="app-dialog-option-value">{session.registered} / {session.capacity}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </MemberDialog>
  );
}
