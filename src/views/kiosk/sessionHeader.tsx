import type { SessionOption } from "@/contracts/kiosk-attendance";
import { formatDuration, formatStartTime } from "@/domain/kiosk/sessionFormat";
import PlainButton from "./plainButton";

// The selected class, kept on screen from Identify (K03) onward.
// Ported from Companion's components/kiosk/session-header: same grid, border
// and type as SessionCard, so it reads as the card you just picked.

type SessionHeaderProps = {
  session: SessionOption;
  onChangeSession?: () => void; // leave out to hide Change class (Result screen)
  changeDisabled?: boolean; // locked while a check-in is sending
};

const SessionHeader = ({ session, onChangeSession, changeDisabled = false }: SessionHeaderProps) => {
  const { time, period } = formatStartTime(session.startsAt, session.timeZone);
  const duration = formatDuration(session.startsAt, session.endsAt);

  return (
    // Phones: time + name on top, Change class on its own row below
    <header className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-2xl border border-(--kiosk-line) bg-(--kiosk-canvas) px-4 py-5 @min-[540px]:grid-cols-[8rem_minmax(0,1fr)_auto] @min-[540px]:gap-8 @min-[540px]:px-6">
      <span className="text-xl leading-none font-semibold tabular-nums @min-[540px]:text-2xl">
        {time}
        {period && (
          <span className="ml-1 text-sm font-medium text-(--kiosk-muted) @min-[540px]:ml-1.5 @min-[540px]:text-base">
            {period}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-col gap-1.5">
        {/* A name that doesn't fit ends in "…" instead of wrapping */}
        <span className="truncate text-lg font-semibold @min-[540px]:text-2xl">{session.title}</span>
        <span className="text-base text-(--kiosk-text-secondary)">{duration}</span>
      </span>

      {onChangeSession && (
        <span className="col-span-full justify-self-start @min-[540px]:col-span-1">
          <PlainButton onClick={onChangeSession} disabled={changeDisabled}>
            Change class
          </PlainButton>
        </span>
      )}
    </header>
  );
};

export default SessionHeader;
