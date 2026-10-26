// Purely decorative. The receipt headline announces the confirmed result.
// Ported from Companion's components/kiosk/success-mark; styles in src/style/css/kiosk.css.
const SuccessMark = ({ animate }: { animate: boolean }) => {
  return (
    <div
      className="relative size-20 shrink-0"
      data-check-in-mark={animate ? "success" : "already-recorded"}
      aria-hidden="true"
    >
      <span className="kiosk-mark-halo" />
      <svg viewBox="0 0 120 120" fill="none" focusable="false" className="relative size-full overflow-visible">
        <circle className="kiosk-mark-disc" cx="60" cy="60" r="43" />
        <circle className="kiosk-mark-track" cx="60" cy="60" r="53" />
        <circle
          className="kiosk-mark-ring"
          cx="60"
          cy="60"
          r="53"
          pathLength="1"
          transform="rotate(-90 60 60)"
        />
        <path className="kiosk-mark-check" d="m42 60 12 12 25-26" pathLength="1" />
      </svg>
    </div>
  );
};

export default SuccessMark;
