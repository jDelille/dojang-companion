import type { CheckInFlowState } from "@/domain/kiosk/checkInFlow";

// Privacy idle timer (K07), without React so it can be tested on its own.
// Same rules as Companion's components/kiosk/idle-warning/useIdleTimer.ts:
// a tap, key press or typing counts as activity; the warning shows for the
// last warningSeconds; at timeoutSeconds with no activity, onTimeout runs once.

export const ACTIVITY_EVENTS = ["pointerdown", "keydown", "input"] as const;

const TICK_MS = 250;

export type IdleTimerOptions = {
  timeoutSeconds: number;
  warningSeconds: number;
  onSecondsLeft: (secondsLeft: number | null) => void; // null = no warning showing
  onTimeout: () => void;
  // Browser defaults below; tests pass their own clock and events
  target?: Pick<EventTarget, "addEventListener" | "removeEventListener">;
  now?: () => number;
  schedule?: (tick: () => void, milliseconds: number) => () => void; // returns a cancel
};

export type IdleTimer = {
  stillHere: () => void; // "I'm still here": counts as activity and closes the warning
  stop: () => void;
};

const everyInterval = (tick: () => void, milliseconds: number) => {
  const id = setInterval(tick, milliseconds);
  return () => clearInterval(id);
};

export function startIdleTimer({
  timeoutSeconds,
  warningSeconds,
  onSecondsLeft,
  onTimeout,
  target = window,
  now = Date.now,
  schedule = everyInterval,
}: IdleTimerOptions): IdleTimer {
  let lastActivityAt = now();
  // undefined until the first tick, so a warning left over from before a restart always clears
  let reported: number | null | undefined = undefined;
  let stopped = false;

  const report = (secondsLeft: number | null) => {
    if (secondsLeft === reported) return;
    reported = secondsLeft;
    onSecondsLeft(secondsLeft);
  };

  const recordActivity = () => {
    lastActivityAt = now();
  };

  // Capture phase, so activity counts even where a control stops the event
  for (const eventName of ACTIVITY_EVENTS) {
    target.addEventListener(eventName, recordActivity, true);
  }

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancel();
    for (const eventName of ACTIVITY_EVENTS) {
      target.removeEventListener(eventName, recordActivity, true);
    }
  };

  const cancel = schedule(() => {
    const idleSeconds = (now() - lastActivityAt) / 1000;
    const remaining = timeoutSeconds - idleSeconds;

    if (remaining <= 0) {
      stop();
      report(null);
      onTimeout();
      return;
    }
    report(remaining <= warningSeconds ? Math.ceil(remaining) : null);
  }, TICK_MS);

  return {
    stillHere: () => {
      lastActivityAt = now();
      report(null);
    },
    stop,
  };
}

// When the timer runs, same as Companion's kiosk page. Off on Welcome (nothing
// to clear), while a check-in is sending (its own timeout bounds it), and while
// a success or already-checked-in result returns to Welcome on its own anyway.
export function idleTimerShouldRun(flow: CheckInFlowState): boolean {
  if (flow.step === "welcome" || flow.step === "sending") return false;
  if (
    flow.step === "result" &&
    (flow.outcome.kind === "success" || flow.outcome.kind === "alreadyCheckedIn")
  ) {
    return false;
  }
  return true;
}
