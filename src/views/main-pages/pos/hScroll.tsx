import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import useHScroll from "../../../hooks/useHScroll";

/*
   Wrapper for the category / plan / suggestion rails.

   Owns its own useHScroll instance, so each rail tracks its own overflow —
   the template kept this per-wrapper too, via one initHScroll() call per
   [data-hscroll] element.
*/

type HScrollProps = {
  children: ReactNode;
  /** Extra classes on the wrapper, e.g. "hscroll-oncard". */
  className?: string;
  /** Extra classes on the scrolling track, e.g. "gap-3 pb-1". */
  trackClassName?: string;
  label: string;
  /** Set for the category rail, which is a tablist. */
  role?: string;
  id?: string;
};

const HScroll = ({
  children,
  className = "",
  trackClassName = "",
  label,
  role,
  id,
}: HScrollProps) => {
  const { trackRef, hasPrev, hasNext, page } = useHScroll();

  return (
    <div
      className={
        `hscroll ${className} ${hasPrev ? "has-prev" : ""} ${hasNext ? "has-next" : ""}`
          .replace(/\s+/g, " ")
          .trim()
      }
    >
      <button
        type="button"
        className="hs-nav hs-prev"
        onClick={() => page(-1)}
        aria-label={`Scroll ${label} left`}
      >
        <ChevronLeft className="ic-14" aria-hidden="true" />
      </button>
      <div
        ref={trackRef}
        id={id}
        role={role}
        aria-label={role ? label : undefined}
        className={`hscroll-track no-sb ${trackClassName}`.trim()}
      >
        {children}
      </div>
      <button
        type="button"
        className="hs-nav hs-next"
        onClick={() => page(1)}
        aria-label={`Scroll ${label} right`}
      >
        <ChevronRight className="ic-14" aria-hidden="true" />
      </button>
    </div>
  );
};

export default HScroll;
