"use client";

import type { SessionRosterAnswer } from "@/integrations/hub";
import { classCounts, ROSTER_LIMIT, type TodaySession } from "@/domain/today";

/*
   Today's "Still to come today": the classes that haven't ended (the Hub's
   context read), each with its instructor and how many are booked, here and
   not arrived (its session_roster, the same counts as Front Desk's arrivals).
   Odoo sends no capacity, so nothing about how full a class is. Rows aren't
   links: DreamOS has no class page yet.
*/

const sectionLabel =
  "mb-3 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

// "5:45 PM", in the viewer's time zone (the classes are read in the browser)
function classTime(iso: string | null) {
  if (!iso) return "Time not sent";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function RosterDetail({ answer, index }: { answer: SessionRosterAnswer | undefined; index: number }) {
  if (index >= ROSTER_LIMIT) return <span className="text-(--crm-muted)">Roster not loaded</span>;
  if (!answer) return <span className="text-(--crm-muted)">Loading…</span>;
  if (answer.outcome === "unavailable") {
    return (
      <span role="alert" title={answer.text} className="text-(--crm-text-secondary)">
        Roster unavailable
      </span>
    );
  }
  const counts = classCounts(answer.roster);
  return (
    <span className="text-(--crm-text-secondary)">
      {counts.booked} booked · {counts.here} here · {counts.notArrived} not arrived
    </span>
  );
}

export default function TodayClasses({
  sessions,
  rosters,
}: {
  sessions: TodaySession[]; // soonest first
  rosters: Record<string, SessionRosterAnswer | undefined>; // undefined: loading or not loaded
}) {
  return (
    <section aria-label="Still to come today" className="rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-4">
      <h2 className={sectionLabel}>Still to come today</h2>
      {sessions.length === 0 ? (
        <p className="text-[12px] text-(--crm-muted)">No more classes today.</p>
      ) : (
        <ul className="divide-y divide-(--crm-line)">
          {sessions.map((session, index) => {
            const answer = rosters[session.id];
            const instructor =
              answer?.outcome === "loaded" ? (answer.roster.session.instructor ?? "No instructor") : null;
            return (
              <li key={session.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 text-[12px]">
                <time dateTime={session.startsAt ?? undefined} className="w-16 shrink-0 text-[13px] font-bold text-(--crm-text)">
                  {classTime(session.startsAt)}
                </time>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-(--crm-text)">
                    {session.title}
                    {!session.future && <span className="ml-2 text-[11px] font-normal text-(--crm-muted)">Started</span>}
                  </span>
                  {instructor && (
                    <span
                      className={`block text-[11px] ${
                        instructor === "No instructor" ? "text-(--crm-brand)" : "text-(--crm-muted)"
                      }`}
                    >
                      {instructor}
                    </span>
                  )}
                </span>
                <RosterDetail answer={answer} index={index} />
              </li>
            );
          })}
        </ul>
      )}
      {sessions.length > ROSTER_LIMIT && (
        <p className="mt-2 text-[11px] text-(--crm-muted)">Rosters load for the first {ROSTER_LIMIT} classes only.</p>
      )}
    </section>
  );
}
