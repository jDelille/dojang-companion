"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Mic } from "lucide-react";
import { attendanceLabel, type RosterMember } from "@/domain/arrivals";
import { focusClassOf, rosterGroups } from "@/domain/instructor";
import { roleLabel } from "@/domain/staff";
import { classCounts, remainingToday, ROSTER_LIMIT, type TodaySession } from "@/domain/today";
import {
  getInboxContext,
  getSessionRoster,
  SIGN_IN_CODES,
  type InboxContextAnswer,
  type SessionRosterAnswer,
} from "@/integrations/hub";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import { ErrorBlock, LoadingBlock } from "@/views/inbox/inboxStates";
import { HubSignOutButton } from "@/views/shell/hubUnavailable";
import StaffSignIn from "@/views/shell/staffSignIn";
import { instructorRailContext } from "./instructorRail";

/*
   The Instructor workspace (the Instructor Perspective's default dashboard;
   Paul's §12 Instructor mode and Instructor Focus): "I arrived to teach. Which
   class, who should be here, who is, who's missing, what do I need?"

     INSTRUCTOR · role                                       [Refresh]
     [the class: time, name, instructor, booked · here · not here yet,
      Check In / Start Class]
     [Not here yet | Here]                   [Lesson plan, class notes, voice]
     [Later today]                                       [Do For Me: Class context]

   No business administration (CRM, messages, tasks): those stay on Today.

   Read-only, from the reads DreamOS already makes (domain/instructor.ts): the
   Hub's context read for today's classes (an instructor's grant sees only their
   own) and session_roster per class. Training area, capacity, readiness, lesson
   plan and class notes aren't sent by the Hub, so they say "Not connected".
   Check In, Start Class and the voice prompt have no Hub action DreamOS
   forwards, so they're disabled. Nothing here writes to Odoo or calls AI.
*/

const NOT_CONNECTED = "Not connected yet";

const sectionLabel =
  "mb-3 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";
const card = "rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-5";
const disabledButton =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-(--crm-line) bg-(--crm-raised) px-4 text-[13px] font-bold text-(--crm-text) disabled:cursor-not-allowed disabled:opacity-60";

// "5:45 PM", in the viewer's time zone (read in the browser)
function clockTime(iso: string | null) {
  if (!iso) return "Time not sent";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// A fact the Hub doesn't send: says so, never a made-up value
function NotConnectedFact({ label, hint }: { label: string; hint: string }) {
  return (
    <div title={hint}>
      <dt className="text-[11px] text-(--crm-muted)">{label}</dt>
      <dd className="text-[13px] font-semibold text-(--crm-muted)">Not connected</dd>
    </div>
  );
}

function Count({ label, value, tone }: { label: string; value: number | null; tone?: "success" }) {
  return (
    <div className="min-w-24 rounded-xl border border-(--crm-line) bg-(--crm-raised) px-4 py-3">
      <p
        className={`text-[28px] font-bold leading-none ${
          tone === "success" ? "text-(--crm-success)" : "text-(--crm-text)"
        }`}
      >
        {value === null ? "–" : value}
      </p>
      <p className="mt-1 text-[11px] text-(--crm-text-secondary)">{label}</p>
    </div>
  );
}

function RosterList({ title, members, empty }: { title: string; members: RosterMember[]; empty: string }) {
  return (
    <section aria-label={title}>
      <h3 className={sectionLabel}>
        {title} · {members.length}
      </h3>
      {members.length === 0 ? (
        <p className="text-[12px] text-(--crm-muted)">{empty}</p>
      ) : (
        <ul className="divide-y divide-(--crm-line)">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
              <Link href={`/people/${member.id}`} className="min-w-0 truncate font-semibold text-(--crm-text) hover:underline">
                {member.name}
              </Link>
              <span className="shrink-0 text-[11px] text-(--crm-muted)">
                {member.rank} · {attendanceLabel(member.attendance)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FocusClass({ session, answer }: { session: TodaySession; answer: SessionRosterAnswer | undefined }) {
  const roster = answer?.outcome === "loaded" ? answer.roster : null;
  const counts = roster ? classCounts(roster) : null;
  const groups = roster ? rosterGroups(roster) : null;

  return (
    <>
      <section aria-label="Your class" className={card}>
        <p className={sectionLabel}>
          {session.future ? "Before class · Attendance and preparation" : "In progress by the schedule"}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-(--crm-text-secondary)">
              <time dateTime={session.startsAt ?? undefined}>{clockTime(session.startsAt)}</time>
              {roster && (
                <>
                  {" – "}
                  <time dateTime={roster.session.endsAt}>{clockTime(roster.session.endsAt)}</time>
                </>
              )}
            </p>
            <h2 className="mt-1 text-[28px] font-bold leading-tight text-(--crm-text)">{session.title}</h2>
            <p className="mt-1 text-[13px] text-(--crm-text-secondary)">
              {roster
                ? roster.session.instructor
                  ? `Instructor · ${roster.session.instructor}`
                  : "No instructor assigned in Odoo"
                : "Instructor · loading…"}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <NotConnectedFact label="Training area" hint="Odoo doesn't send the class's studio or area to DreamOS yet" />
            <NotConnectedFact label="Capacity" hint="Odoo doesn't send class capacity to DreamOS yet" />
            <NotConnectedFact label="Readiness" hint="Odoo doesn't send class readiness to DreamOS yet" />
          </dl>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Count label="Booked" value={counts?.booked ?? null} />
          <Count label="Here" value={counts?.here ?? null} tone="success" />
          <Count label="Not here yet" value={counts?.notArrived ?? null} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" disabled title={NOT_CONNECTED} className={disabledButton}>
            Check In
          </button>
          <button
            type="button"
            disabled
            title={NOT_CONNECTED}
            className={`${disabledButton} border-transparent bg-(--crm-brand) text-white`}
          >
            Start Class
          </button>
          <span className="self-center text-[11px] text-(--crm-muted)">
            Check In and Start Class aren&apos;t connected yet. Nothing is recorded from here.
          </span>
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Roster" className={card}>
          {!answer ? (
            <p className="text-[12px] text-(--crm-muted)">Loading the roster…</p>
          ) : answer.outcome === "unavailable" ? (
            <p role="alert" className="text-[12px] text-(--crm-text-secondary)">
              The roster couldn&apos;t be read. {answer.text}
            </p>
          ) : groups && roster && roster.members.length === 0 ? (
            <p className="text-[12px] text-(--crm-muted)">No one is booked for this class.</p>
          ) : (
            groups && (
              <div className="grid gap-6 md:grid-cols-2">
                <RosterList title="Not here yet" members={groups.notHere} empty="Everyone booked is here." />
                <RosterList title="Here" members={groups.here} empty="No one has checked in yet." />
                {groups.recorded.length > 0 && (
                  <RosterList title="Recorded, not attending" members={groups.recorded} empty="" />
                )}
              </div>
            )
          )}
        </section>

        <section aria-label="Teaching" className={card}>
          <h3 className={sectionLabel}>Lesson plan</h3>
          <p className="mb-5 text-[12px] text-(--crm-muted)">
            Not connected. Odoo doesn&apos;t send lesson plans to DreamOS yet.
          </p>
          <h3 className={sectionLabel}>Class notes</h3>
          <p className="mb-5 text-[12px] text-(--crm-muted)">
            Not connected. Notes can&apos;t be saved here yet; nothing is written to Odoo.
          </p>
          <button type="button" disabled title={NOT_CONNECTED} className={disabledButton}>
            <Mic size={14} aria-hidden="true" />
            Class voice prompt
          </button>
        </section>
      </div>
    </>
  );
}

function LaterToday({
  sessions,
  rosters,
  focusId,
  onChoose,
}: {
  sessions: TodaySession[];
  rosters: Record<string, SessionRosterAnswer | undefined>;
  focusId: string;
  onChoose: (sessionId: string) => void;
}) {
  const others = sessions.filter((session) => session.id !== focusId);
  if (others.length === 0) return null;
  return (
    <section aria-label="Other classes today" className={card}>
      <h2 className={sectionLabel}>Other classes today</h2>
      <ul className="divide-y divide-(--crm-line)">
        {others.map((session) => {
          const answer = rosters[session.id];
          let detail = "Roster not loaded";
          if (answer?.outcome === "unavailable") detail = "Roster unavailable";
          else if (answer?.outcome === "loaded") {
            const counts = classCounts(answer.roster);
            detail = `${counts.booked} booked · ${counts.here} here`;
          } else if (sessions.indexOf(session) < ROSTER_LIMIT) detail = "Loading…";
          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => onChoose(session.id)}
                className="flex w-full items-baseline gap-4 py-3 text-start text-[12px] hover:text-(--crm-text)"
              >
                <time dateTime={session.startsAt ?? undefined} className="w-16 shrink-0 text-[13px] font-bold text-(--crm-text)">
                  {clockTime(session.startsAt)}
                </time>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-(--crm-text)">{session.title}</span>
                <span className="shrink-0 text-(--crm-text-secondary)">{detail}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function InstructorWorkspace({ source }: { source: "hub" | "fixture" }) {
  const [answer, setAnswer] = useState<InboxContextAnswer | null>(null); // null while loading
  const [rosters, setRosters] = useState<Record<string, SessionRosterAnswer | undefined>>({});
  const [reads, setReads] = useState(0); // counts reloads, so rosters are read again
  const [chosenId, setChosenId] = useState<string | null>(null); // a class picked from "Other classes"

  // The first read, when the page opens
  useEffect(() => {
    let cancelled = false;
    getInboxContext().then((next) => {
      if (!cancelled) setAnswer(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Read everything again (Refresh, after sign-in or sign-out)
  const reload = useCallback(async () => {
    setAnswer(null);
    setRosters({});
    setChosenId(null);
    setReads((count) => count + 1);
    setAnswer(await getInboxContext());
  }, []);

  const context = answer?.outcome === "loaded" ? answer.context : null;
  const needsSignIn = answer?.outcome === "unavailable" && SIGN_IN_CODES.includes(answer.code ?? "");
  const sessions = context ? remainingToday(context) : [];
  // The picked class while it's still on today's list, otherwise the one to teach now
  const focus = sessions.find((session) => session.id === chosenId) ?? focusClassOf(sessions);

  // Today's first classes' rosters, plus the focus class's if it's further down
  const rosterIdList = sessions.slice(0, ROSTER_LIMIT).map((session) => session.id);
  if (focus && !rosterIdList.includes(focus.id)) rosterIdList.push(focus.id);
  const rosterIds = rosterIdList.join(",");

  useEffect(() => {
    if (!rosterIds) return;
    let cancelled = false;
    for (const id of rosterIds.split(",")) {
      getSessionRoster(id).then((next) => {
        if (!cancelled) setRosters((current) => ({ ...current, [id]: next }));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [rosterIds, reads]);

  const focusAnswer = focus ? rosters[focus.id] : undefined;
  const focusRoster = focusAnswer?.outcome === "loaded" ? focusAnswer.roster : null;

  return (
    <div className="crm-scope">
      {source === "hub" && <Link href="/operations?section=shifts" className="mb-4 inline-block text-sm underline">Instructor shifts and timesheets</Link>}
      {context && <DoForMeFocus focusKey="instructor" context={instructorRailContext(focus, focusRoster)} />}

      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)">
          Instructor
          {context && ` · ${roleLabel(context.principal.role)}`}
        </h1>
        <div className="flex items-center gap-4 text-[12px] text-(--crm-text-secondary)">
          <button
            type="button"
            onClick={() => void reload()}
            disabled={!answer}
            className="font-bold text-(--crm-text) hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
          {source === "hub" && context && <HubSignOutButton onSignedOut={reload} />}
        </div>
      </header>

      {source === "fixture" && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample data · Development preview, not connected to Odoo.
        </p>
      )}

      {needsSignIn ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <StaffSignIn onSignedIn={reload} />
        </div>
      ) : !answer ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <LoadingBlock label="Loading your classes…" />
        </div>
      ) : answer.outcome === "unavailable" ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <ErrorBlock message={`Today's classes couldn't be read. ${answer.text}`} onRetry={() => void reload()} />
        </div>
      ) : !focus ? (
        <div className={card}>
          <p className="text-[13px] text-(--crm-text-secondary)">No classes left today in Odoo.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <FocusClass session={focus} answer={focusAnswer} />
          <LaterToday sessions={sessions} rosters={rosters} focusId={focus.id} onChoose={setChosenId} />
        </div>
      )}
    </div>
  );
}
