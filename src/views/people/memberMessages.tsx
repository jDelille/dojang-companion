'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { memberMessagesFrom, type MemberMessages as Messages } from '@/domain/memberMessages';
import { CHANNEL_LABELS, DELIVERY_LABELS, MESSAGE_STATE_LABELS } from '@/domain/inbox';
import { getInboxContext, SIGN_IN_CODES } from '@/integrations/hub';
import { explainHubError } from '@/domain/hubAction';
import HubUnavailable from '@/views/shell/hubUnavailable';

export default function MemberMessages({ memberId, onAuthenticationLost }: { memberId: string; onAuthenticationLost: () => void }) {
  const [read, setRead] = useState<{ outcome: 'loaded'; value: Messages } | { outcome: 'unavailable'; code: string } | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void getInboxContext().then(answer => {
      if (cancelled) return;
      if (answer.outcome === 'unavailable') {
        if (SIGN_IN_CODES.includes(answer.code ?? '')) { onAuthenticationLost(); return; }
        setRead({ outcome: 'unavailable', code: answer.code ?? 'BACKEND_UNAVAILABLE' }); return;
      }
      const value = memberMessagesFrom(answer.context, memberId);
      setRead(value ? { outcome: 'loaded', value } : { outcome: 'unavailable', code: 'HUB_RESPONSE_UNREADABLE' });
    });
    return () => { cancelled = true; };
  }, [memberId, reload, onAuthenticationLost]);
  if (read?.outcome === 'unavailable' && SIGN_IN_CODES.includes(read.code)) return <HubUnavailable code={read.code} text={explainHubError(read.code)} />;
  return <section className="rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5" aria-label="Linked member messages">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-(--crm-text)">Messages</h2><button type="button" className="text-[12px] font-bold underline underline-offset-4" onClick={() => { setRead(null); setReload(n => n + 1); }}>Refresh messages</button></header>
    <p className="mt-3 text-[12px] text-(--crm-muted)">Inbound messages explicitly linked to this student in the authorized Inbox read. Household and name matches are not used. This is not a complete conversation history.</p>
    {!read && <p role="status" className="mt-4 text-[13px]">Loading linked messages…</p>}
    {read?.outcome === 'unavailable' && <p role="alert" className="mt-4 text-[13px]">{explainHubError(read.code)}</p>}
    {read?.outcome === 'loaded' && <>
      {(read.value.capped || read.value.deliveriesCapped) && <p className="mt-3 text-[12px] text-(--crm-muted)">This Inbox read reached a source limit; older messages or delivery records may be omitted.</p>}
      {read.value.rows.length === 0 ? <p className="mt-4 text-[13px] text-(--crm-text-secondary)">No messages linked to this student were included in this Inbox read.</p> : <ul className="mt-4 divide-y divide-(--crm-line)">{read.value.rows.map(message => <li key={message.id} className="space-y-2 py-4 text-[13px]">
        <p className="font-bold text-(--crm-text)">{CHANNEL_LABELS[message.channel] ?? message.channel} · {MESSAGE_STATE_LABELS[message.state]}</p>
        <p className="text-[12px] text-(--crm-muted)">{message.guardianName || 'Sender identity not provided'} · Message #{message.id}</p>
        <p className="whitespace-pre-wrap break-words text-(--crm-text-secondary)">{message.text}</p>
        {message.deliveries.map(delivery => <p key={delivery.id} className="text-[12px] text-(--crm-muted)">Reply delivery #{delivery.id}: {DELIVERY_LABELS[delivery.state]}</p>)}
        <Link href={`/inbox?message=${message.id}`} className="inline-block font-semibold text-(--crm-text) underline underline-offset-4">Open in Inbox</Link>
      </li>)}</ul>}
      <p className="mt-4 text-[11px] text-(--crm-muted)">Message timestamps are not provided by this read. Reply drafting, review and sending stay in Inbox; accepted by provider does not mean delivered.</p>
    </>}
  </section>;
}
