import type { RosterMember } from "@/contracts/kiosk-attendance";

// K03 tap-your-name grid (Jodi's PR #41 in Companion, on in production there).
// The whole class is listed as tiles and typing only narrows it down.
// On by default to match production; NEXT_PUBLIC_DOJANG_KIOSK_ROSTER_GRID=false
// goes back to search only (nobody listed until 2 letters are typed).
// Read at build time, like every NEXT_PUBLIC_ variable.
export const ROSTER_GRID = process.env.NEXT_PUBLIC_DOJANG_KIOSK_ROSTER_GRID !== "false";

// The tiles to show for the filter text: names starting with it (any case), A to Z.
// An empty filter shows everyone, unlike searchRoster().
export const rosterTiles = (roster: RosterMember[], query: string): RosterMember[] => {
  const filter = query.trim().toLocaleLowerCase();
  return roster
    .filter((member) => !filter || member.displayName.toLocaleLowerCase().startsWith(filter))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
};
