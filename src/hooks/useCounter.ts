import { useEffect, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

const DURATION = 1400;

export function useCounter(target: number, prefix = ""): string {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  // Derived rather than stored, so a reduced-motion visitor renders the final
  // value on the very first pass instead of animating up to it.
  const shown = reduceMotion ? target : value;

  return prefix + shown.toLocaleString("en-US");
}

export default useCounter;
