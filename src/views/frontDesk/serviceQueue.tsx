"use client";

import Link from "next/link";
import type { HubContext, HubMessage } from "@/domain/inbox";
import {matchesQueue} from '@/domain/inboxWorkspace';
import { deliveryOf, senderName } from "@/views/inbox/inboxCompanion";

/*
   Front Desk's SERVICE QUEUE (do-for-me-1.png): the guardian messages from
   WhatsMax that still need staff, from the Hub's inbox read (the Inbox's
   getInboxContext). Each row says what kind of work it is, from the message's
   Hub state, and who sent it. Tapping one makes its linked member the active
   context; it's handled in the Inbox ("Open queue"). The Hub has no payment or
   other request types, no email or calls, so only messages are listed.
*/

const SHOWN = 6;
const DELIVERY_WORK_LABELS:Record<string,string> = {uncertain:"Delivery uncertain",failed:"Delivery failed",cancelled:"Delivery cancelled"};

// What staff have to do, from the Hub's message state (no reply approved yet)
const WORK_LABELS: Record<HubMessage["state"], string> = {
  unmatched: "Guardian verification",
  received: "Guardian request",
  resolved: "Reply to review",
};

const sectionLabel =
  "mb-3 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

export default function ServiceQueue({
  context,
  selectedId,
  onSelect,
}: {
  context: HubContext;
  selectedId: string | null;
  onSelect: (message: HubMessage) => void;
}) {
  const waiting = context.messages.filter((message) => matchesQueue(context,message,'needs'));

  return (
    <section aria-label="Service queue" className="flex min-w-0 flex-col rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-4">
      <span className={sectionLabel}>Service queue</span>
      {waiting.length === 0 ? (
        <p className="text-[12px] text-(--crm-muted)">No messages need staff.</p>
      ) : (
        <ul className="divide-y divide-(--crm-line)">
          {waiting.slice(0, SHOWN).map((message) => {
            const selected = message.id === selectedId;
            const delivery=deliveryOf(context,message.id);
            const workLabel=(delivery&&DELIVERY_WORK_LABELS[delivery.state])||WORK_LABELS[message.state];
            return (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => onSelect(message)}
                  aria-pressed={selected}
                  className={`flex w-full items-center justify-between gap-3 rounded-md py-3 text-start text-[12px] ${
                    selected ? "text-(--crm-text)" : "text-(--crm-text) hover:opacity-80"
                  }`}
                >
                  <span className={`font-bold ${selected ? "underline" : ""}`}>{workLabel}</span>
                  <span className="min-w-0 truncate text-(--crm-text-secondary)">{senderName(message)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {waiting.length > SHOWN && <p className="mt-1 text-[11px] text-(--crm-muted)">{waiting.length - SHOWN} more in the Inbox.</p>}
      <Link
        href="/inbox"
        className="mt-3 inline-flex h-9 w-fit items-center rounded-lg border border-(--crm-line) bg-(--crm-raised) px-3 text-[12px] font-bold text-(--crm-text) hover:border-(--crm-muted)"
      >
        Open queue →
      </Link>
      <p className="mt-3 text-[10px] text-(--crm-muted)">Guardian SMS and WhatsApp only. Email and calls aren&apos;t connected yet.</p>
    </section>
  );
}
