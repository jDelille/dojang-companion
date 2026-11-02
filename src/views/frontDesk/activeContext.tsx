"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Sparkles } from "lucide-react";
import type { HubMessage } from "@/domain/inbox";
import type { MemberBooking } from "@/domain/member";
import { memberInitials, membershipLabel } from "@/domain/member-presentation";
import type { MemberRecordAnswer } from "@/integrations/member";
import { readMemberForInbox } from "@/integrations/memberForInbox";
import { DoForMeFocus, useDoForMe } from "@/views/doForMe/doForMeProvider";
import { memberCompanionContext } from "@/domain/memberCompanion";
import StaffSignIn from "@/views/shell/staffSignIn";
import { SIGN_IN_CODES } from "@/integrations/hub";
import { senderName } from "@/views/inbox/inboxCompanion";

/*
   Front Desk's ACTIVE CONTEXT card (do-for-me-1.png): the member staff are
   dealing with, from the same member read as Member 360 and the Inbox panel
   (member_details). Shows only what that read returns: membership, rank and
   stripes, and the next booked class. Test readiness isn't sent, so it says
   "Not connected" (Odoo doesn't send the household either). The actions are
   the mockup's; only ✦ (open Do For Me) works, the rest are not connected yet.
*/

export type ActiveContextItem = { kind: "member"; memberId: string; message?: HubMessage } | { kind: "message"; message: HubMessage } | null;

const NOT_CONNECTED = "Not connected yet";

const sectionLabel =
  "mb-3 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

const actionButton =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--crm-line) bg-(--crm-raised) px-3 text-[12px] font-bold text-(--crm-text) disabled:cursor-not-allowed disabled:opacity-60";

// "5:45 PM" today, "Thu 5:45 PM" on another day
function classTime(iso: string) {
  const time = new Date(iso);
  const clock = time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (time.toDateString() === new Date().toDateString()) return clock;
  return `${time.toLocaleDateString([], { weekday: "short" })} ${clock}`;
}

function nextClass(bookings: MemberBooking[] | undefined, capped?: boolean) {
  if (!bookings) return { text: "Unavailable", title: "This read didn't include bookings" };
  const next = [...bookings].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
  if (!next) return { text: capped ? "Unknown" : "None booked", title: capped ? "The booking list may be incomplete" : undefined };
  return { text: classTime(next.startsAt), title: next.title };
}

function Tile({ label, value, title, muted }: { label: string; value: string; title?: string; muted?: boolean }) {
  return (
    <div className="rounded-lg bg-(--crm-raised) px-3 py-2" title={title}>
      <span className="block text-[10px] text-(--crm-muted)">{label}</span>
      <span className={`mt-0.5 block truncate text-[12px] font-bold ${muted ? "text-(--crm-muted)" : "text-(--crm-text)"}`}>
        {value}
      </span>
    </div>
  );
}

function MemberCard({ memberId }: { memberId: string }) {
  const [answer, setAnswer] = useState<MemberRecordAnswer | null>(null); // null while loading
  const doForMe = useDoForMe();
  const companion = useMemo(() => answer?.outcome === "loaded" ? memberCompanionContext(answer.member, answer.attendance) : null, [answer]);

  // One read per member; the card is keyed by the member id, so a new member starts from "loading"
  useEffect(() => {
    let cancelled = false;
    readMemberForInbox(memberId).then(
      (next) => {
        if (!cancelled) setAnswer(next);
      },
      () => {
        if (!cancelled) setAnswer({ outcome: "unavailable", code: "", text: "Odoo isn't reachable right now." });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  if (!answer) return <p role="status" className="text-[12px] text-(--crm-muted)">Loading the member…</p>;
  if (answer.outcome === "missing") {
    return <p className="text-[12px] text-(--crm-text-secondary)">Member #{memberId} isn&apos;t in the member records.</p>;
  }
  if (answer.outcome === "unavailable") {
    if (SIGN_IN_CODES.includes(answer.code)) return <StaffSignIn onSignedIn={() => { void readMemberForInbox(memberId).then(setAnswer); }} />;
    return <p role="alert" className="text-[12px] text-(--crm-text-secondary)">The member couldn&apos;t be shown. {answer.text}</p>;
  }

  const { member } = answer;
  const stripes = member.rank.stripes;
  const subtitle = stripes === undefined ? member.rank.name : `${member.rank.name} · ${stripes} ${stripes === 1 ? "stripe" : "stripes"}`;
  const next = nextClass(member.bookings, member.bookingsCapped);
  const active = member.membershipState === "active";

  return (
    <>
      {companion && <DoForMeFocus focusKey={`member:${member.id}`} context={companion} />}
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-canvas) font-(family-name:--crm-font-label) text-[11px] font-bold text-(--crm-text)"
        >
          {memberInitials(member)}
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/people/${member.id}`} className="block truncate text-[18px] font-bold text-(--crm-text) hover:underline">
            {member.name}
          </Link>
          <p className="text-[13px] text-(--crm-text-secondary)">{subtitle}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.12em] ${
            active ? "border-(--crm-success) text-(--crm-success)" : "border-(--crm-status) text-(--crm-status)"
          }`}
        >
          {membershipLabel(member)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Tile label="Membership" value={membershipLabel(member)} />
        <Tile label="Next class" value={next.text} title={next.title} muted={next.text === "Unavailable"} />
        <Tile label="Test readiness" value="Not connected" title="Odoo doesn't send test readiness to DreamOS yet" muted />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled title={NOT_CONNECTED} className={`${actionButton} border-transparent bg-(--crm-brand) text-white`}>
          Check in
        </button>
        {["Book", "Payment", "Message"].map((label) => (
          <button key={label} type="button" disabled title={NOT_CONNECTED} className={actionButton}>
            {label}
          </button>
        ))}
        <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
          <Pencil size={12} aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => doForMe.aim(`member:${member.id}`)}
          aria-label={`Ask Companion about ${member.name}`}
          title="Ask Companion about this member"
          className={`${actionButton} hover:border-(--crm-muted)`}
        >
          <Sparkles size={13} aria-hidden="true" className="text-(--crm-agent)" />
        </button>
      </div>
      <p className="mt-2 text-[11px] text-(--crm-muted)">Check in, Book, Payment, Message and Edit aren&apos;t connected yet.</p>
    </>
  );
}

export default function ActiveContext({ item }: { item: ActiveContextItem }) {
  return (
    <section aria-label="Active context" className="min-w-0 rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-4">
      <span className={sectionLabel}>Active context</span>
      {!item ? (
        <p className="text-[12px] text-(--crm-text-secondary)">
          No one is active yet. Tap a member in Arriving soon or a message in the service queue, or open a member&apos;s
          record.
        </p>
      ) : item.kind === "message" ? (
        <div className="space-y-3">
          <p className="text-[13px] text-(--crm-text-secondary)">
            The message from <span className="font-bold text-(--crm-text)">{senderName(item.message)}</span> isn&apos;t
            linked to a member record.
          </p>
          <Link href={`/inbox?message=${item.message.id}`} className={`${actionButton} hover:border-(--crm-muted)`}>
            Open in Inbox
          </Link>
        </div>
      ) : (
        <>
          {item.message && (
            <div className="mb-4 rounded-lg border border-(--crm-line) bg-(--crm-raised) p-3">
              <p className="text-[12px] text-(--crm-text-secondary)">Message from {senderName(item.message)} · linked by Hub member identity</p>
              <Link href={`/inbox?message=${item.message.id}`} className="mt-2 inline-block text-[12px] font-bold text-(--crm-text) underline underline-offset-4">Open this request in Inbox →</Link>
            </div>
          )}
          <MemberCard key={item.memberId} memberId={item.memberId} />
        </>
      )}
    </section>
  );
}
