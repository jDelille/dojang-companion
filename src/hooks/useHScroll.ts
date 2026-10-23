import { useCallback, useEffect, useRef, useState } from "react";
const DRAG_THRESHOLD = 6;
/** Tolerance for "already at the end", absorbing sub-pixel scroll positions. */
const EDGE = 4;

export type HScroll = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  hasPrev: boolean;
  hasNext: boolean;
  page: (dir: 1 | -1) => void;
};

export function useHScroll(): HScroll {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const page = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: dir * Math.max(track.clientWidth * 0.8, 160),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      setHasPrev(track.scrollLeft > EDGE);
      setHasNext(track.scrollLeft < max - EDGE);
    };

    /* A plain vertical wheel should move a horizontal rail. */
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      const next = track.scrollLeft + e.deltaY;
      // Let the page scroll once the rail is at either end.
      if (next < 0 || next > max) return;
      e.preventDefault();
      track.scrollLeft = next;
    };

    let down = false;
    let moved = false;
    let startX = 0;
    let startL = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startL = track.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      moved = true;
      track.classList.add("dragging");
      track.scrollLeft = startL - dx;
    };
    const endDrag = () => {
      down = false;
      track.classList.remove("dragging");
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointerleave", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    /* Content is injected after mount, so re-measure when it changes. */
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    ro?.observe(track);
    sync();

    return () => {
      track.removeEventListener("wheel", onWheel);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", endDrag);
      track.removeEventListener("pointerleave", endDrag);
      track.removeEventListener("pointercancel", endDrag);
      track.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      ro?.disconnect();
    };
  }, []);

  return { trackRef, hasPrev, hasNext, page };
}

export default useHScroll;
