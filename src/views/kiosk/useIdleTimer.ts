"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { startIdleTimer, type IdleTimer } from "./idleTimer";

type UseIdleTimerOptions = {
  active: boolean; // the timer only runs while this is true
  restartKey: string; // changing it (e.g. moving to a new step) restarts the timer
  timeoutSeconds: number;
  warningSeconds: number;
  onTimeout: () => void;
};

// Privacy idle timer (K07) for the kiosk page. The timing rules live in idleTimer.ts.
export function useIdleTimer({
  active,
  restartKey,
  timeoutSeconds,
  warningSeconds,
  onTimeout,
}: UseIdleTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timer = useRef<IdleTimer | null>(null);
  const timeout = useEffectEvent(onTimeout);

  useEffect(() => {
    if (!active) return;

    const running = startIdleTimer({
      timeoutSeconds,
      warningSeconds,
      onSecondsLeft: setSecondsLeft,
      onTimeout: () => timeout(),
    });
    timer.current = running;

    return () => {
      running.stop();
      timer.current = null;
      setSecondsLeft(null); // a paused or restarted timer never leaves a warning up
    };
  }, [active, restartKey, timeoutSeconds, warningSeconds]);

  return {
    secondsLeft: active ? secondsLeft : null,
    stillHere: () => timer.current?.stillHere(),
  };
}
