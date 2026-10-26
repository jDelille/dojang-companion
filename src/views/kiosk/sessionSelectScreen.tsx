import type { SessionOption } from "@/contracts/kiosk-attendance";
import type { SessionsLoad } from "@/domain/kiosk/checkInFlow";
import { sessionsInTimeOrder } from "@/domain/kiosk/sessionFormat";
import PlainButton from "./plainButton";
import SessionCard from "./sessionCard";
import StatusMessage from "./statusMessage";

// K02 Choose your class. Ported from Companion's components/kiosk/screens/session-select-screen.

type SessionSelectScreenProps = {
  sessions: SessionsLoad;
  onSelect: (session: SessionOption) => void;
  onRetry: () => void;
  onBack: () => void;
};

const SessionSelectScreen = ({ sessions, onSelect, onRetry, onBack }: SessionSelectScreenProps) => {
  return (
    <div className="flex flex-col py-8">
      {/* When unavailable, Back sits next to Try again instead, so there's only one.
          min-h keeps the layout still when Back is hidden. */}
      <div className="flex min-h-12 items-center">
        {sessions.status !== "unavailable" && (
          <PlainButton flush onClick={onBack}>
            ← Back
          </PlainButton>
        )}
      </div>

      <h1 className="mt-8 text-[2rem] leading-[1.1] font-bold tracking-[-0.04em] @min-[540px]:text-[3rem]">
        Choose your class
      </h1>

      <h2 className="mt-10 border-b border-(--kiosk-line) pb-4 text-xs font-semibold tracking-[0.05em] text-(--kiosk-text-secondary) uppercase">
        Today
      </h2>

      {/* role="status" so screen readers hear loading / empty / unavailable */}
      {sessions.status === "loading" && (
        <>
          <p className="sr-only" role="status">
            Loading today&apos;s classes…
          </p>
          {/* Placeholder rows shaped like SessionCard while the list loads */}
          <ul className="mt-4 grid grid-cols-1 gap-3" aria-hidden="true">
            {[1, 2, 3].map((placeholder) => (
              <li
                key={placeholder}
                className="grid animate-pulse grid-cols-[4.75rem_1fr] items-center gap-7 rounded-[18px] border border-(--kiosk-line) bg-(--kiosk-panel) px-4 py-7 motion-reduce:animate-none @min-[540px]:grid-cols-[8rem_1fr] @min-[540px]:gap-8 @min-[540px]:px-5"
              >
                <span className="block h-7 w-20 rounded-[10px] bg-(--kiosk-raised)" />
                {/* Same height as a real row's name + details, so nothing jumps on load */}
                <span className="flex min-h-[3.4rem] flex-col justify-center gap-2.5">
                  <span className="block h-5 w-2/5 rounded-[10px] bg-(--kiosk-raised)" />
                  <span className="block h-3.5 w-[15%] rounded-[10px] bg-(--kiosk-raised)" />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {sessions.status === "unavailable" && (
        <StatusMessage
          message="Classes can't be loaded right now."
          actions={[
            { label: "Try again", onClick: onRetry },
            { label: "Back", onClick: onBack },
          ]}
        />
      )}

      {sessions.status === "ready" && sessions.list.length === 0 && (
        <StatusMessage message="No classes today." detail="Please see the front desk." />
      )}

      {sessions.status === "ready" && sessions.list.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-3">
          {sessionsInTimeOrder(sessions.list).map((session) => (
            <li key={session.sessionId}>
              <SessionCard session={session} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionSelectScreen;
