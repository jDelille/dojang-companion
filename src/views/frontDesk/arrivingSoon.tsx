"use client";

import { useState } from "react";
import { ARRIVED_STATES, attendanceLabel, EXPECTED_STATES, type RosterMember } from "@/domain/arrivals";
import type { HubContext } from "@/domain/inbox";
import type { SessionRosterAnswer } from "@/integrations/hub";

/*
   Front Desk's context pane, "Arriving soon" (do-for-me-1.png): today's classes
   that haven't ended (the Hub's context read), each with how many are booked
   and how many are in (the Hub's session_roster). The chosen class opens its
   roster: ✓ here (present or late), ○ not arrived (booked, nothing recorded),
   and anything else recorded by name. Tapping a member makes them the active
   context. Odoo sends no capacity, trials per class or kiosk status, so none are
   shown as numbers.
*/

export type TodaySession = HubContext["sessions"][number];

const sectionLabel =
  "mb-2 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

// "4:15" with "PM" beside it, in the viewer's time zone
function ClassTime({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-[11px] text-(--crm-muted)">Time not sent</span>;
  const time = new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const [clock, period] = time.split(" ");
  return (
    <time dateTime={iso} className="text-[13px] font-bold text-(--crm-text)">
      {clock}
      {period && <span className="ml-0.5 text-[9px] font-normal text-(--crm-muted)">{period}</span>}
    </time>
  );
}

const isArrived = (member: RosterMember) => ARRIVED_STATES.includes(member.attendance);
const isExpected = (member: RosterMember) => EXPECTED_STATES.includes(member.attendance);

export default function ArrivingSoon({
  sessions,
  rosters,
  rosterLimit,
  selectedSessionId,
  onSelectSession,
  activeMemberId,
  onSelectMember,
}: {
  sessions: TodaySession[]; // soonest first
  rosters: Record<string, SessionRosterAnswer | undefined>; // undefined: loading or not loaded
  rosterLimit: number;
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
  activeMemberId: string | null;
  onSelectMember: (memberId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const wanted = search.trim().toLowerCase();

  // A class matches by its name, or by someone booked in it
  const memberMatches = (member: RosterMember) => !wanted || member.name.toLowerCase().includes(wanted);
  const shown = sessions.filter((session) => {
    if (!wanted || session.title.toLowerCase().includes(wanted)) return true;
    const roster = rosters[session.id];
    return roster?.outcome === "loaded" && roster.roster.members.some(memberMatches);
  });

  return (
    <aside aria-label="Arriving soon" className="p-4">
      <h2 className="mb-4 text-[18px] font-bold text-(--crm-text)">Arriving soon</h2>
      <input
        type="search"
        aria-label="Search arrivals"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search arrivals..."
        className="mb-4 h-11 w-full rounded-xl border border-(--crm-line) bg-(--crm-panel) px-3 text-[13px] text-(--crm-text) placeholder:text-(--crm-text-secondary) focus:border-(--crm-muted) focus:outline-none"
      />

      {sessions.length === 0 ? (
        <p className="text-[12px] text-(--crm-muted)">No classes left today in Odoo.</p>
      ) : shown.length === 0 ? (
        <p className="text-[12px] text-(--crm-muted)">No classes or bookings match.</p>
      ) : (
        <ul className="space-y-1">
          {shown.map((session) => {
            const index = sessions.indexOf(session);
            const answer = rosters[session.id];
            const selected = session.id === selectedSessionId;
            let detail = "Loading…";
            if (index >= rosterLimit) detail = "Roster not loaded";
            else if (answer?.outcome === "unavailable") detail = "Roster unavailable";
            else if (answer?.outcome === "loaded") {
              const members = answer.roster.members;
              detail = `${members.length} booked · ${members.filter(isArrived).length} in`;
            }
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onSelectSession(selected ? null : session.id)}
                  aria-expanded={selected}
                  className={`flex w-full gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors ${
                    selected ? "border-(--crm-line) bg-(--crm-raised)" : "border-transparent hover:bg-(--crm-raised)"
                  }`}
                >
                  <span className="w-10 shrink-0">
                    <ClassTime iso={session.startsAt} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-(--crm-text)">{session.title}</span>
                    <span className="block text-[11px] text-(--crm-muted)">
                      {detail}
                      {!session.future && " · started"}
                    </span>
                  </span>
                </button>

                {selected && (
                  <div className="mt-1 mb-2 pl-3">
                    {!answer ? (
                      <p className="px-3 py-1 text-[11px] text-(--crm-muted)">
                        {index >= rosterLimit ? "This class's roster isn't loaded here." : "Loading the roster…"}
                      </p>
                    ) : answer.outcome === "unavailable" ? (
                      <p role="alert" className="px-3 py-1 text-[11px] text-(--crm-text-secondary)">{answer.text}</p>
                    ) : answer.roster.members.length === 0 ? (
                      <p className="px-3 py-1 text-[11px] text-(--crm-muted)">No one is booked.</p>
                    ) : (
                      <ul aria-label={`${session.title} roster`}>
                        {answer.roster.members.filter(memberMatches).map((member) => {
                          const active = member.id === activeMemberId;
                          const marker = isArrived(member) ? "✓" : isExpected(member) ? "○" : "–";
                          return (
                            <li key={member.id}>
                              <button
                                type="button"
                                onClick={() => onSelectMember(member.id)}
                                aria-pressed={active}
                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-start text-[12px] ${
                                  active ? "bg-(--crm-interactive) text-(--crm-text)" : "text-(--crm-text-secondary) hover:text-(--crm-text)"
                                }`}
                              >
                                <span aria-hidden="true" className={isArrived(member) ? "text-(--crm-success)" : "text-(--crm-muted)"}>
                                  {marker}
                                </span>
                                <span className="min-w-0 flex-1 truncate">{member.name}</span>
                                <span className="shrink-0 text-[10px] text-(--crm-muted)">
                                  {isArrived(member) ? "In" : attendanceLabel(member.attendance)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {answer?.outcome === "loaded" && answer.roster.session.instructor && (
                      <p className="px-3 pt-1 text-[10px] text-(--crm-muted)">Instructor: {answer.roster.session.instructor}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {sessions.length > rosterLimit && (
        <p className="mt-2 text-[11px] text-(--crm-muted)">Rosters load for the first {rosterLimit} classes only.</p>
      )}

      <section aria-label="Kiosk" className="mt-6">
        <span className={sectionLabel}>Kiosk</span>
        <p className="text-[12px] text-(--crm-muted)">Kiosk status isn&apos;t connected yet.</p>
      </section>
    </aside>
  );
}
