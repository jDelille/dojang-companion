import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const MOBILE_QUERY = "(max-width:1023px)";

export const usePrefersDark = () =>
  useMediaQuery("(prefers-color-scheme: dark)");

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
