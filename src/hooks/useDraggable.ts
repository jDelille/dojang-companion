import { useEffect, type RefObject } from "react";

export function useDraggable(
  elRef: RefObject<HTMLElement | null>,
  handleRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const el = elRef.current;
    const handle = handleRef.current;
    if (!el || !handle) return;

    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let dragging = false;

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      el.style.left = ox + e.clientX - sx + "px";
      el.style.top = oy + e.clientY - sy + "px";
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      handle.style.cursor = "grab";
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // Let the header's own controls receive their click.
      if ((e.target as HTMLElement).closest("button, input, a")) return;

      dragging = true;
      const r = el.getBoundingClientRect();
      ox = r.left;
      oy = r.top;
      sx = e.clientX;
      sy = e.clientY;
      /* Switch from the CSS right/bottom anchor to explicit coordinates. */
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.left = ox + "px";
      el.style.top = oy + "px";
      handle.style.cursor = "grabbing";
      e.preventDefault();
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    };

    handle.addEventListener("pointerdown", onDown);
    return () => {
      handle.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, [elRef, handleRef]);
}

export default useDraggable;
