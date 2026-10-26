import type { SessionOption } from "@/contracts/kiosk-attendance";
import { formatDuration, formatStartTime } from "@/domain/kiosk/sessionFormat";

// One class as a full-width row: time | class + details | arrow.
// Ported from Companion's components/kiosk/session-card.

type SessionCardProps = {
  session: SessionOption;
  onSelect: (session: SessionOption) => void;
};

const SessionCard = ({ session, onSelect }: SessionCardProps) => {
  const { time, period } = formatStartTime(session.startsAt, session.timeZone);
  // End time from the same session data and school time zone, for "4:15 PM – 4:55 PM"
  const end = formatStartTime(session.endsAt, session.timeZone);
  const duration = formatDuration(session.startsAt, session.endsAt);
  const instructor = session.instructor || "Instructor to be confirmed";
  const spokenLabel = `${session.title}, ${time} ${period}, ${duration}, ${instructor}, ${session.seatsTaken} of ${session.capacity} spots taken`;

  return (
    <button
      type="button"
      onClick={() => onSelect(session)}
      aria-label={spokenLabel}
      className="grid min-h-[104px] w-full cursor-pointer grid-cols-[6rem_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-(--kiosk-line) bg-(--kiosk-panel) px-4 py-5 text-left text-(--kiosk-text) transition-colors hover:border-(--kiosk-text-secondary) hover:bg-(--kiosk-raised) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--kiosk-text-secondary) active:border-(--kiosk-text-secondary) active:bg-(--kiosk-raised) @min-[540px]:grid-cols-[11rem_minmax(0,1fr)_auto] @min-[540px]:gap-6 @min-[540px]:px-6"
    >
      <span className="text-xl leading-[1.3] font-semibold tabular-nums">
        {time}
        {period && <span className="ml-1 text-sm font-medium text-(--kiosk-muted)">{period}</span>}
        <span aria-hidden="true"> – </span>
        {end.time}
        {end.period && <span className="ml-1 text-sm font-medium text-(--kiosk-muted)">{end.period}</span>}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        {/* a very long name ends in "…" instead of pushing the layout */}
        <span className="truncate text-lg font-semibold @min-[540px]:text-2xl">{session.title}</span>
        <span className="text-base text-(--kiosk-text-secondary)">
          {instructor}
          {session.location ? ` · ${session.location}` : ""}
        </span>
        <span className="text-base text-(--kiosk-text-secondary)">
          {session.seatsTaken} / {session.capacity} booked
        </span>
      </span>
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-full border border-(--kiosk-line) text-lg text-(--kiosk-text-secondary)"
      >
        ↗
      </span>
    </button>
  );
};

export default SessionCard;
