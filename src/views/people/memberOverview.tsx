"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import type { Member, MemberAttendance } from "@/domain/member";
import { membershipLabel } from "@/domain/member-presentation";

/*
   Member 360's Overview tab, laid out like Jodi's mockup: Member story on the
   left, Training and Progression on the right. Ported from Companion 1cab554b
   src/components/people/member-360/member-grid/MemberGrid.tsx.

   Only real records are shown. A field DreamOS doesn't receive from its source
   (the Hub read has no such field, or the fixture leaves it out) says
   "Not connected": that is DreamOS not knowing, not Odoo recording nothing.
   The ✎ buttons aren't connected yet.
*/

const NOT_CONNECTED = "Not connected";
const NOT_CONNECTED_HINT = "DreamOS doesn't receive this field yet";

const cardLabel =
  "block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

type Stat = { label: string; value: ReactNode; action?: ReactNode };

function StatList({ stats }: { stats: Stat[] }) {
  return (
    <ul className="mb-5">
      {stats.map((stat) => (
        <li
          key={stat.label}
          className="flex min-h-11 items-center justify-between gap-4 border-b border-(--crm-line) py-2 text-[13px] text-(--crm-text-secondary)"
        >
          {stat.label}
          <div className="flex items-center gap-2 text-right">
            <span
              title={stat.value === NOT_CONNECTED ? NOT_CONNECTED_HINT : undefined}
              className={
                stat.value === NOT_CONNECTED
                  ? "font-medium text-(--crm-muted)"
                  : "font-bold text-(--crm-text)"
              }
            >
              {stat.value}
            </span>
            {stat.action}
          </div>
        </li>
      ))}
    </ul>
  );
}

// One plain sentence from real records only, e.g. "Active member · 4 check-ins this week."
function storyHeadline(member: Member, attendance: MemberAttendance) {
  const state = `${membershipLabel(member)} member`;
  const { count, complete } = attendance.lastSevenDays;
  const checkIns = `${count} ${count === 1 ? "check-in" : "check-ins"}`;
  // The source's list was cut off (or its limit unknown): the real number may be
  // higher, so an incomplete 0 is unknown, never "none"
  if (!complete) {
    if (count === 0) return `${state} · this week's check-ins can't be counted exactly.`;
    return `${state} · at least ${checkIns} this week.`;
  }
  if (count === 0) return `${state} · no check-ins this week.`;
  return `${state} · ${checkIns} this week.`;
}

// "Jan 2025"
function joinDate(iso?: string) {
  if (!iso) return NOT_CONNECTED;
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// "Today" or "Aug 31", in the viewer's time zone (worked out in the browser only)
const noSubscription = () => () => {};
function DayLabel({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    noSubscription,
    () => {
      const day = new Date(iso);
      if (day.toDateString() === new Date().toDateString()) return "Today";
      return day.toLocaleDateString([], { month: "short", day: "numeric" });
    },
    () => "",
  );
  return <time dateTime={iso}>{text}</time>;
}

// What Recent says when there are no check-ins to list. Only a complete source
// confirms there are none (lastSevenDays.complete: the list wasn't cut off and
// its limit is known); without a history at all, DreamOS doesn't receive it.
function noRecentText(attendance: MemberAttendance) {
  if (attendance.history === undefined) return "Check-in history isn't connected.";
  if (!attendance.lastSevenDays.complete) return "Check-in history couldn't be confirmed.";
  return "Nothing recorded yet.";
}

// The last three check-ins, newest first (the newest are always in the source's
// list, even when it's cut off)
function recentCheckIns(attendance: MemberAttendance) {
  if (attendance.history?.length) return attendance.history.slice(0, 3);
  if (attendance.latest) return [attendance.latest];
  return [];
}

function EditButton({ field }: { field: string }) {
  return (
    <button
      type="button"
      disabled
      title="Not connected yet"
      aria-label={`Edit ${field}`}
      className="grid size-7 place-items-center rounded-md border border-(--crm-line) bg-(--crm-interactive) text-(--crm-text) transition-colors hover:border-(--crm-muted)"
    >
      <Pencil size={11} aria-hidden="true" />
    </button>
  );
}

const card = "rounded-xl border border-(--crm-line) bg-(--crm-panel) p-5";

export default function MemberOverview({
  member,
  attendance,
}: {
  member: Member;
  attendance: MemberAttendance;
}) {
  const recent = recentCheckIns(attendance);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className={card} aria-label="Member story">
        <header className="mb-2">
          <span className={cardLabel}>Member story</span>
          <h2 className="mt-3 text-lg font-bold leading-snug text-(--crm-text)">
            {storyHeadline(member, attendance)}
          </h2>
        </header>
        <StatList
          stats={[
            {
              label: "Attendance",
              value:
                member.attendanceRate === undefined
                  ? NOT_CONNECTED
                  : `${Math.round(member.attendanceRate * 100)}%`,
            },
            { label: "Classes", value: member.classesAttended ?? NOT_CONNECTED },
            { label: "Current rank", value: member.rank.name },
            { label: "Join date", value: joinDate(member.joinedOn) },
          ]}
        />

        <span className={cardLabel}>Recent</span>
        {recent.length ? (
          <ul className="mt-2">
            {recent.map((checkIn) => (
              <li
                key={checkIn.checkedInAt}
                className="flex items-center gap-4 border-b border-(--crm-line) py-2.5 text-[12px]"
              >
                <strong className="w-12 shrink-0 font-bold text-(--crm-text)">
                  <DayLabel iso={checkIn.checkedInAt} />
                </strong>
                <span className="text-(--crm-text-secondary)">
                  Checked in · {checkIn.sessionTitle}
                </span>
                {checkIn.late && (
                  <em className="rounded-full border border-(--crm-line) px-2 text-[10px] not-italic text-(--crm-text-secondary)">
                    Late
                  </em>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] text-(--crm-muted)">{noRecentText(attendance)}</p>
        )}
      </section>

      <section className={card} aria-label="Training">
        <header className="mb-2">
          <span className={cardLabel}>Training</span>
        </header>
        <StatList
          stats={[
            {
              label: "Program",
              value: member.training?.program ?? NOT_CONNECTED,
              action: <EditButton field="program" />,
            },
            {
              label: "Primary instructor",
              value: member.training?.primaryInstructor ?? NOT_CONNECTED,
              action: <EditButton field="primary instructor" />,
            },
            {
              label: "Team",
              value: member.training?.team ?? NOT_CONNECTED,
              action: <EditButton field="team" />,
            },
            {
              label: "Home location",
              value: member.training?.homeLocation ?? NOT_CONNECTED,
              action: <EditButton field="home location" />,
            },
          ]}
        />

        {/* Rank has no ✎: it changes through a reviewed rank award */}
        <span className={cardLabel}>Progression</span>
        <StatList stats={[{ label: "Current rank", value: member.rank.name }]} />
      </section>
    </div>
  );
}
