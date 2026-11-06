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
import MemberTools, {type MemberTool} from '@/views/people/memberTools';
import MemberBookDialog from '@/views/people/memberBookDialog';
import StaffSignIn from "@/views/shell/staffSignIn";
import { SIGN_IN_CODES } from "@/integrations/hub";
import { senderName } from "@/views/inbox/inboxCompanion";

/* Front Desk active member follows the writeup console. Existing Member 360
   tools provide reviewed attendance, booking, invoice checkout and contact edits.
   Message routes to the governed Inbox; unsupported readiness is not invented. */

export type ActiveContextItem = { kind: "member"; memberId: string; message?: HubMessage } | { kind: "message"; message: HubMessage } | null;

const REAL_ACTION_REQUIRED = "This action needs the real Odoo connection";

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
  const next = bookings.filter(b=>Date.parse(b.startsAt)>=Date.now()).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
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

function MemberCard({ memberId, hubMode, sessionId, messageId, onAuthenticationLost, onRefresh }: { memberId: string; hubMode:boolean; sessionId:string | null; messageId?:string; onAuthenticationLost:()=>void; onRefresh:()=>void }) {
  const [tool,setTool]=useState<MemberTool | null>(null);
  const [booking,setBooking]=useState(false);
  const [answer, setAnswer] = useState<MemberRecordAnswer | null>(null); // null while loading
  const doForMe = useDoForMe();
  const companion = useMemo(() => answer?.outcome === "loaded" ? memberCompanionContext(answer.member, answer.attendance) : null, [answer]);

  // One read per member; the card is keyed by the member id, so a new member starts from "loading"
  useEffect(() => {
    let cancelled = false;
    readMemberForInbox(memberId).then(
      (next) => {
        if (!cancelled) { if(next.outcome === "unavailable" && SIGN_IN_CODES.includes(next.code))onAuthenticationLost(); else setAnswer(next); }
      },
      () => {
        if (!cancelled) setAnswer({ outcome: "unavailable", code: "", text: "Odoo isn't reachable right now." });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [memberId,onAuthenticationLost]);

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
        <button type="button" disabled={!hubMode} title={!hubMode?REAL_ACTION_REQUIRED:'Review staff attendance in Odoo'} onClick={()=>setTool('attendance')} className={`${actionButton} border-transparent bg-(--crm-brand) text-white`}>Check in</button>
        <button type="button" disabled={!hubMode} title={!hubMode?REAL_ACTION_REQUIRED:undefined} onClick={()=>setBooking(true)} className={actionButton}>Book</button>
        <button type="button" disabled={!hubMode} title={!hubMode?REAL_ACTION_REQUIRED:undefined} onClick={()=>setTool('payment')} className={actionButton}>Payment</button>
        <Link href={messageId?`/inbox?message=${encodeURIComponent(messageId)}`:'/inbox'} title="Review messages in the Inbox" className={actionButton}>Message</Link>
        <button type="button" disabled={!hubMode} title={!hubMode?REAL_ACTION_REQUIRED:undefined} onClick={()=>setTool('edit')} className={actionButton}><Pencil size={12} aria-hidden="true"/>Edit</button>
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
      <p className="mt-2 text-[11px] text-(--crm-muted)">Changes require review in Odoo. Message opens the Inbox; it does not send a new message.</p>
      {hubMode&&tool&&<MemberTools memberId={member.id} tool={tool} initialSessionId={tool==='attendance'?(sessionId??''):''} onClose={()=>{setTool(null);onRefresh();}} onAuthenticationLost={onAuthenticationLost}/>}
      {hubMode&&booking&&<MemberBookDialog member={member} onClose={()=>{setBooking(false);onRefresh();}} onAuthenticationLost={onAuthenticationLost}/> }
    </>
  );
}

export default function ActiveContext({ item, hubMode, sessionId, onAuthenticationLost, onRefresh }: { item: ActiveContextItem; hubMode:boolean; sessionId:string | null; onAuthenticationLost:()=>void; onRefresh:()=>void }) {
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
          <MemberCard key={item.memberId} memberId={item.memberId} hubMode={hubMode} sessionId={sessionId} messageId={item.message?.id} onAuthenticationLost={onAuthenticationLost} onRefresh={onRefresh} />
        </>
      )}
    </section>
  );
}
