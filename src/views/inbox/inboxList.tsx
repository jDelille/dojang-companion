"use client";

import { MessageCircle, Smartphone } from "lucide-react";
import {
  CHANNEL_LABELS,
  DELIVERY_LABELS,
  MESSAGE_STATE_LABELS,
  type HubContext,
  type HubMessage,
} from "@/domain/inbox";
import { deliveryOf, memberName, needsStaff, senderName } from "./inboxCompanion";
import { Badge, type BadgeTone } from "./inboxStates";

/*
   The inbox's left pane. Row layout adapted from licensed Roster 1.0.0
   components/inbox/inbox-client.tsx (conversation rows: name, channel, badges,
   one-line preview, aria-current; docs/LICENSE-MAP.md).

   Each row is ONE Hub message (a work item), not a conversation: the Hub has no
   thread model, so messages from the same guardian stay separate rows. The Hub's
   read has no received time, so rows show none.
*/

// SMS and WhatsApp look different (Roster used one phone icon for both)
const CHANNEL_ICONS: Record<string, typeof Smartphone> = { sms: Smartphone, whatsapp: MessageCircle };

const STATE_TONES: Record<HubMessage["state"], BadgeTone> = {
  unmatched: "warning",
  received: "warning",
  resolved: "info",
};

// Roster's truncate(): one line of preview
const preview = (text: string) => (text.length > 52 ? `${text.slice(0, 51).trimEnd()}…` : text);

export default function InboxList({
  context,
  messages,
  selectedId,
  onSelect,
}: {
  context: HubContext;
  messages: HubMessage[];
  selectedId: string | null;
  onSelect: (messageId: string) => void;
}) {
  return (
    <ul className="divide-y divide-(--crm-line) overflow-y-auto">
      {messages.map((message) => {
        const Icon = CHANNEL_ICONS[message.channel] ?? MessageCircle;
        const selected = message.id === selectedId;
        const delivery = deliveryOf(context, message.id);
        const student = memberName(context, message.memberId);
        return (
          <li key={message.id}>
            <button
              type="button"
              onClick={() => onSelect(message.id)}
              aria-current={selected ? "true" : undefined}
              className={`w-full px-4 py-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--crm-brand) ${
                selected ? "bg-(--crm-interactive)" : "hover:bg-(--crm-raised)"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-(--crm-text)">
                  {senderName(message)}
                </span>
                {needsStaff(context, message) && <Badge tone="warning">Needs you</Badge>}
              </div>
              <p className="mt-1 truncate text-[12px] text-(--crm-text-secondary)">{preview(message.text)}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge>
                  <Icon size={10} aria-hidden="true" />
                  {CHANNEL_LABELS[message.channel] ?? message.channel}
                </Badge>
                {delivery ? (
                  <Badge tone={delivery.state === "failed" || delivery.state === "uncertain" ? "danger" : "neutral"}>
                    {DELIVERY_LABELS[delivery.state]}
                  </Badge>
                ) : (
                  <Badge tone={STATE_TONES[message.state]}>
                    {message.state === "resolved" && message.reply ? "Draft to review" : MESSAGE_STATE_LABELS[message.state]}
                  </Badge>
                )}
                {student && <span className="text-[11px] text-(--crm-muted)">{student}</span>}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
