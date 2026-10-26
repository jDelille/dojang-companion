"use client";

import { useEffect, useRef } from "react";
import type { RosterMember, SessionOption } from "@/contracts/kiosk-attendance";
import type { RosterLoad } from "@/domain/kiosk/checkInFlow";
import type { RosterSearch } from "@/domain/kiosk/rosterSearch";
import PlainButton from "./plainButton";
import { rosterTiles } from "./rosterGrid";
import SearchResult from "./searchResult";
import SessionHeader from "./sessionHeader";
import StatusMessage from "./statusMessage";

// K03 Identify: find your name in the selected class's roster.
// Ported from Companion's components/kiosk/screens/identify-screen. Two modes:
// - with `roster`: the tap-your-name grid lists the whole class, typing filters it
// - without: search only, nobody shows until 2 letters are typed
// Not here yet: "Get help from staff" (opens the Concierge in Companion).

type IdentifyScreenProps = {
  session: SessionOption;
  rosterStatus: RosterLoad["status"];
  query: string;
  search: RosterSearch; // worked out by searchRoster(), not here
  onQueryChange: (query: string) => void;
  onSelectMember: (member: RosterMember) => void;
  onRetry: () => void;
  onChangeSession: () => void;
  onBack: () => void;
  roster?: RosterMember[]; // given only in grid mode (see rosterGrid.ts)
};

const IdentifyScreen = ({
  session,
  rosterStatus,
  query,
  search,
  onQueryChange,
  onSelectMember,
  onRetry,
  onChangeSession,
  onBack,
  roster,
}: IdentifyScreenProps) => {
  const searchField = useRef<HTMLInputElement>(null);
  const canSearch = rosterStatus !== "unavailable";

  // Put the cursor in the field whenever it's usable: on arrival, and again
  // after Try again recovers, so nobody has to tap it first. Focusing also
  // opens the on-screen keyboard, which is what this screen is for. Not in the
  // grid, where the keyboard would cover the names people are meant to tap.
  useEffect(() => {
    if (canSearch && !roster) searchField.current?.focus();
  }, [canSearch, roster]);
  const tiles = rosterTiles(roster ?? [], query);

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex min-h-12 items-center">
        <PlainButton flush onClick={onBack}>
          ← Back
        </PlainButton>
      </div>

      <SessionHeader session={session} onChangeSession={onChangeSession} />

      <div className="flex flex-col gap-6">
        <h1
          id="find-your-name"
          className="mt-4 text-[2rem] leading-[1.1] font-bold tracking-[-0.04em] @min-[540px]:text-[3rem]"
        >
          {roster ? "Tap your name" : "Find your name"}
        </h1>

        {/* One large field, the only thing to do on this screen */}
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute top-1/2 left-5 size-6 -translate-y-1/2 text-(--kiosk-muted)"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          {/* Phones: still at least 16px, or iOS zooms into the field.
              The focus: overrides undo the dashboard's global form-field ring. */}
          <input
            ref={searchField}
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={roster ? "Type to filter names" : "Start typing your first name"}
            aria-labelledby="find-your-name"
            disabled={!canSearch}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            className="min-h-16 w-full rounded-2xl border border-(--kiosk-line) bg-(--kiosk-canvas) py-0 pr-6 pl-[3.75rem] text-lg text-(--kiosk-text) placeholder:text-(--kiosk-muted) focus:border-(--kiosk-line) focus:shadow-none focus:ring-0 focus:outline-none focus-visible:border-(--kiosk-brand) disabled:opacity-50 @min-[540px]:text-2xl"
          />
        </div>

        {/* Results sit right under the field so the on-screen keyboard doesn't cover them */}
        <div className="-mt-6">
          {rosterStatus === "loading" && <StatusMessage message="Loading the class list…" />}

          {rosterStatus === "unavailable" && (
            <StatusMessage
              message="The class list can't be loaded right now."
              actions={[
                { label: "Try again", onClick: onRetry },
                { label: "Change class", onClick: onChangeSession },
              ]}
            />
          )}

          {roster &&
            rosterStatus === "ready" &&
            (tiles.length ? (
              <ul
                className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]"
                aria-label="Students in this class"
              >
                {tiles.map((member) => (
                  <li key={member.memberId}>
                    <SearchResult
                      tile
                      candidate={member}
                      checkedIn={member.attendanceState === "present"}
                      onSelect={() => onSelectMember(member)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <StatusMessage
                message={
                  roster.length
                    ? "No names match that filter."
                    : `No students are booked in ${session.title} yet.`
                }
                actions={[{ label: "Change class", onClick: onChangeSession }]}
              />
            ))}

          {!roster && rosterStatus === "ready" && search.status === "noMatch" && (
            <StatusMessage
              message={`We couldn't find that name in ${session.title}.`}
              detail="Check the spelling, or get help from staff."
              actions={[{ label: "Change class", onClick: onChangeSession }]}
            />
          )}

          {!roster && rosterStatus === "ready" && search.status === "found" && (
            <ul className="mt-6 flex flex-col gap-3" aria-label="Matching names">
              {search.matches.map((member) => (
                <li key={member.memberId}>
                  <SearchResult candidate={member} onSelect={() => onSelectMember(member)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentifyScreen;
