import type { RosterMember } from "@/contracts/kiosk-attendance";

// One name on the Identify screen (K03): initials, name, arrow, or a grid tile.
// Ported from Companion's components/kiosk/search-result. Shows only what the
// roster already limits it to: first name + last initial ("Ava M.").

type SearchResultProps = {
  candidate: Pick<RosterMember, "memberId" | "displayName">;
  onSelect: () => void;
  tile?: boolean; // the tap-your-name grid: avatar over the name, no arrow
  checkedIn?: boolean; // tiles only: a green "Checked in" pill
};

// First letter of the first and last word: "Ava M." -> "AM", "Mary Ann K." -> "MK"
const initialsOf = (displayName: string) => {
  const words = displayName.split(" ").filter((word) => word.length > 0);
  if (words.length === 0) return "";

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
};

const SearchResult = ({ candidate, onSelect, tile = false, checkedIn = false }: SearchResultProps) => {
  // Tiles laid out like Paul's HTML kiosk (Companion's roster grid): a large
  // avatar circle with the name centred under it. Checked-in students can still
  // be tapped; the server answers "already checked in".
  if (tile) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`flex min-h-[170px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border px-3 pt-5 pb-10 text-center text-(--kiosk-text) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--kiosk-text-secondary) ${
          checkedIn
            ? "relative border-(--kiosk-success) bg-[color-mix(in_srgb,var(--kiosk-success)_8%,var(--kiosk-panel))]"
            : "relative border-(--kiosk-line) bg-(--kiosk-panel) hover:border-(--kiosk-text-secondary) hover:bg-(--kiosk-raised) active:border-(--kiosk-text-secondary) active:bg-(--kiosk-raised)"
        }`}
      >
        <span
          aria-hidden="true"
          className="flex size-[72px] shrink-0 items-center justify-center rounded-full border border-(--kiosk-line) bg-(--kiosk-canvas) text-xl font-semibold"
        >
          {initialsOf(candidate.displayName)}
        </span>
        <span className="max-w-full min-w-0 truncate text-2xl font-semibold">{candidate.displayName}</span>
        {checkedIn && (
          <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 rounded-full border border-[color-mix(in_srgb,var(--kiosk-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--kiosk-success)_14%,transparent)] px-2.5 py-0.5 text-xs font-semibold tracking-[0.04em] whitespace-nowrap text-(--kiosk-success) uppercase">
            Checked in
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex min-h-16 w-full cursor-pointer items-center gap-3.5 rounded-2xl border border-(--kiosk-line) bg-(--kiosk-panel) px-6 py-4 text-left text-(--kiosk-text) transition-colors hover:border-(--kiosk-text-secondary) hover:bg-(--kiosk-raised) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--kiosk-text-secondary) active:border-(--kiosk-text-secondary) active:bg-(--kiosk-raised)"
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--kiosk-line) bg-(--kiosk-canvas) text-sm font-semibold"
      >
        {initialsOf(candidate.displayName)}
      </span>
      <span className="min-w-0 truncate text-2xl font-semibold">{candidate.displayName}</span>
      {/* The arrow circle lights up with the card */}
      <span
        aria-hidden="true"
        className="ml-auto grid size-9 shrink-0 place-items-center rounded-full border border-(--kiosk-line) text-base text-(--kiosk-text-secondary) transition-colors group-hover:border-(--kiosk-text-secondary) group-hover:bg-(--kiosk-interactive) group-hover:text-(--kiosk-text) group-active:border-(--kiosk-text-secondary) group-active:bg-(--kiosk-interactive) group-active:text-(--kiosk-text)"
      >
        ↗
      </span>
    </button>
  );
};

export default SearchResult;
