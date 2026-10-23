import { useCallback, useEffect, useState } from "react";

export function useFullscreen(onBlocked?: (msg: string) => void): {
  isFullscreen: boolean;
  toggle: () => void;
} {
  const [isFullscreen, setIsFullscreen] = useState(
    () => !!document.fullscreenElement,
  );

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        ?.catch(() => onBlocked?.("Fullscreen was blocked by the browser"));
    } else {
      void document.exitFullscreen?.();
    }
  }, [onBlocked]);

  return { isFullscreen, toggle };
}

export default useFullscreen;
