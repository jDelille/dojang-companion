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
import { Badge, type BadgeTone } from "@/templates/roster/components/ui/data";
import { cn } from "@/templates/roster/lib/utils";

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

// Roster's muted line under the preview: channel · state · student
function metaLine(context: HubContext, message: HubMessage) {
  const delivery = deliveryOf(context, message.id);
  const state = delivery
    ? DELIVERY_LABELS[delivery.state]
    : message.state === "resolved" && message.reply
      ? "Draft to review"
      : MESSAGE_STATE_LABELS[message.state];
  const student = memberName(context, message.memberId);
  return [CHANNEL_LABELS[message.channel] ?? message.channel, state, student].filter(Boolean).join(" · ");
}

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
    <ul className="scrollbar-thin divide-y divide-[color:var(--color-border)] overflow-y-auto">
      {messages.map((message) => {
        const Icon = CHANNEL_ICONS[message.channel] ?? MessageCircle;
        const selected = message.id === selectedId;
        const delivery = deliveryOf(context, message.id);
        const failed = delivery !== null && (delivery.state === "failed" || delivery.state === "uncertain");
        return (
          <li key={message.id}>
            <button
              type="button"
              onClick={() => onSelect(message.id)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "w-full px-4 py-3 text-start transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--color-accent)]",
                selected ? "bg-[color:var(--color-accent)]/10" : "hover:bg-white/[0.03]",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 muted" strokeWidth={1.75} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{senderName(message)}</span>
                {needsStaff(context, message) && <Badge tone="warning">Needs you</Badge>}
                {delivery && failed && <Badge tone="alert">{DELIVERY_LABELS[delivery.state]}</Badge>}
                {!delivery && message.state === "unmatched" && (
                  <Badge tone={STATE_TONES[message.state]}>{MESSAGE_STATE_LABELS[message.state]}</Badge>
                )}
              </div>
              <p className="mt-1 truncate text-xs muted">{preview(message.text)}</p>
              <p className="mt-1 truncate text-[11px] muted">{metaLine(context, message)}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
