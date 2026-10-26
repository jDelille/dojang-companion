// Quiet text button for secondary actions: Back, Try again, Change class.
// Ported from Companion's primitives/plain-button: an oval that only shows on press.

type PlainButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean; // e.g. while a check-in is sending
  // Line the text up with the content's left edge (Back in a top bar). The oval
  // then sits in the margin instead of pushing the text in.
  flush?: boolean;
};

const PlainButton = ({ children, onClick, disabled = false, flush = false }: PlainButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent px-3 text-base text-(--kiosk-text) transition-colors hover:border-(--kiosk-line) hover:bg-(--kiosk-raised) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--kiosk-text-secondary) active:border-(--kiosk-line) active:bg-(--kiosk-raised) disabled:cursor-default disabled:border-transparent disabled:bg-transparent disabled:text-(--kiosk-muted) @min-[540px]:px-5 ${flush ? "-ms-3 @min-[540px]:-ms-5" : ""}`}
    >
      {children}
    </button>
  );
};

export default PlainButton;
