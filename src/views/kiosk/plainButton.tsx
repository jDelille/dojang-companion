// Source parity: Companion daniel/kiosk-design @445212cf src/components/primitives/plain-button/PlainButton.tsx
import type { ReactNode } from "react";
import styles from "./daniel/PlainButton.module.css";

type Props = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean; // e.g. while a check-in is sending
  // Line the text up with the content's left edge (Back in a top bar). The oval
  // hover background then sits in the margin instead of pushing the text in.
  flush?: boolean;
  className?: string;
};

// Quiet text button for secondary actions: Back, Try again, Change class.
const PlainButton = ({
  children,
  onClick,
  disabled = false,
  flush = false,
  className,
}: Props) => {
  const classNames = [styles.button, flush && styles.flush, className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default PlainButton;
