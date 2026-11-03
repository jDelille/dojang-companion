"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import type { HubMessage } from "@/domain/inbox";
import type { MemberBooking, WindowCount } from "@/domain/member";
import { membershipLabel } from "@/domain/member-presentation";
import { readMemberForInbox } from "@/integrations/memberForInbox";
import type { MemberRecordAnswer } from "@/integrations/member";
import { TimeLabel } from "@/views/crm/localTime";
import MemberAvatar from "@/views/people/memberAvatar";
import { senderName } from "./inboxCompanion";

/*
   The Inbox's third pane: the Odoo member a message is linked to, next to the
   message (the WhatsMax writeup's "Inbox becomes a projection of the person":
   WhatsMax provides the communication, Odoo provides the member truth).

   Read with the same member read as Member 360 (readMemberForInbox ->
   getMemberRecord -> Hub member_details). Read-only. Only the fields that read
   returns are shown; a message without a linked member says so and nothing is
   matched by name.
*/

const sectionLabel =
  "mb-2 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

const BOOKINGS_SHOWN = 3;

// "4" (exact), "at least 30" when the list was cut off, and "Not known exactly"
// for an incomplete 0, which is unknown, never "none"
function countText(value: WindowCount) {
  if (value.complete) return String(value.count);
  if (value.count === 0) return "Not known exactly";
  return `at least ${value.count}`;
}

// Why there's no member, from what the Hub says about the message
function notLinkedReason(message: HubMessage) {
  if (message.state === "unmatched") {
    return "The sender isn't a verified guardian yet, so Odoo hasn't linked this message to a student.";
  }
  return "No student has been confirmed for this message yet.";
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-(--crm-line) py-2 text-[12px]">
      <dt className="text-(--crm-text-secondary)">{label}</dt>
      <dd className="text-right font-bold text-(--crm-text)">{children}</dd>
    </div>
  );
}

function Bookings({ bookings, capped }: { bookings: MemberBooking[] | undefined; capped: boolean }) {
  if (!bookings) {
    return <p className="text-[12px] text-(--crm-muted)">Unavailable from this read.</p>;
  }
  if (bookings.length === 0) {
    return <p className="text-[12px] text-(--crm-muted)">No upcoming classes booked.</p>;
  }
  const sorted = [...bookings].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const hidden = sorted.length - BOOKINGS_SHOWN;
  return (
    <ul className="space-y-1.5">
      {sorted.slice(0, BOOKINGS_SHOWN).map((booking) => (
        <li key={booking.sessionId} className="flex justify-between gap-3 text-[12px]">
          <span className="min-w-0 truncate font-semibold text-(--crm-text)">{booking.title}</span>
          <span className="shrink-0 text-(--crm-text-secondary)">
            <TimeLabel iso={booking.startsAt} />
          </span>
        </li>
      ))}
      {(hidden > 0 || capped) && (
        <li className="text-[11px] text-(--crm-muted)">
          {hidden > 0 && `${hidden} more booked. `}
          {capped && "Odoo sent its limit, so there may be more."}
        </li>
      )}
    </ul>
  );
}

export default function MemberContextPanel({
  message,
  source,
  staffRole,
}: {
  message: HubMessage;
  source: "hub" | "fixture";
  staffRole: string; // the signed-in staff member's Hub role ("instructor" sees only their own classes)
}) {
  const memberId = message.memberId;
  const [answer, setAnswer] = useState<MemberRecordAnswer | null>(null); // null while loading
  const [attempt, setAttempt] = useState(0);

  // One read per linked member. The panel is keyed by the member id, so a
  // different member starts from "loading".
  useEffect(() => {
    if (!memberId) return;
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
  }, [memberId, attempt]);

  function retry() {
    setAnswer(null);
    setAttempt((count) => count + 1);
  }

  const onlyOwnClasses = staffRole === "instructor";

  return (
    <aside
      aria-label="Member context"
      className="flex min-h-40 flex-col overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-elevated)] 2xl:max-h-[calc(100vh-15rem)]"
    >
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <span className={sectionLabel}>Linked member</span>

        {!memberId ? (
          <div className="flex gap-3">
            <UserRound size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-(--crm-muted)" />
            <div>
              <p className="text-[13px] font-bold text-(--crm-text)">Not linked to a member record</p>
              <p className="mt-1 text-[12px] text-(--crm-text-secondary)">{notLinkedReason(message)}</p>
            </div>
          </div>
        ) : !answer ? (
          <p role="status" className="text-[12px] text-(--crm-muted)">
            Loading the member record…
          </p>
        ) : answer.outcome === "missing" ? (
          <p className="text-[12px] text-(--crm-text-secondary)">
            Member #{memberId} isn&apos;t in the member records.
          </p>
        ) : answer.outcome === "unavailable" ? (
          <div role="alert">
            <p className="text-[12px] text-(--crm-text-secondary)">
              The member record couldn&apos;t be shown. {answer.text}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) hover:border-(--crm-muted)"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Identity: who the message is about, and who sent it */}
            <div className="flex items-start gap-3">
              <MemberAvatar member={answer.member} size="small" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-(--crm-text)">{answer.member.name}</p>
                <p className="mt-0.5 text-[11px] text-(--crm-text-secondary)">
                  Message from {senderName(message)}
                </p>
              </div>
            </div>

            <dl>
              <Row label="Membership">{membershipLabel(answer.member)}</Row>
              <Row label="Rank">
                <span className="text-(--crm-mastery)">
                  {answer.member.rank.name}
                  {answer.member.rank.stripes !== undefined &&
                    ` · ${answer.member.rank.stripes} ${answer.member.rank.stripes === 1 ? "stripe" : "stripes"}`}
                </span>
              </Row>
              <Row label="Last attendance">
                {answer.attendance.latest ? (
                  <>
                    {answer.attendance.latest.sessionTitle}
                    <span className="block text-[11px] font-normal text-(--crm-text-secondary)">
                      <TimeLabel iso={answer.attendance.latest.checkedInAt} />
                    </span>
                  </>
                ) : (
                  <span className="font-normal text-(--crm-muted)">No check-ins on record</span>
                )}
              </Row>
              <Row label="Check-ins, last 7 days">{countText(answer.attendance.lastSevenDays)}</Row>
            </dl>

            <section aria-label="Upcoming classes">
              <span className={sectionLabel}>Upcoming classes</span>
              <Bookings bookings={answer.member.bookings} capped={answer.member.bookingsCapped ?? false} />
            </section>

            {onlyOwnClasses && (
              <p className="text-[11px] text-(--crm-muted)">
                Attendance and bookings include only the classes your access covers.
              </p>
            )}
          </div>
        )}
      </div>

      {memberId && (
        <div className="border-t border-(--crm-line) px-4 py-3">
          <Link
            href={`/people/${memberId}`}
            className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) hover:border-(--crm-muted)"
          >
            Open full profile
          </Link>
          <p className="mt-2 text-[10px] text-(--crm-muted)">
            {source === "hub" ? "From Odoo · read-only" : "Sample member · development preview"}
          </p>
        </div>
      )}
    </aside>
  );
}
