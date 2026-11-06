// Companion daniel/kiosk-design @445212cf src/components/kiosk/idle-warning/IdleWarning.tsx
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Modal from "./daniel/modal";
import styles from "./daniel/IdleWarning.module.css";
import PrimaryButton from "./daniel/primaryButton";

type Props = {
  secondsLeft: number | null;
  onStillHere: () => void;
};

// "Still there?" shown in the last seconds before the privacy reset (K07).
const IdleWarning = ({ secondsLeft, onStillHere }: Props) => {
  const isOpen = secondsLeft !== null;

  // Give focus back to where it was (e.g. the search field) after "I'm still here"
  const focusBeforeWarning = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (isOpen)
      focusBeforeWarning.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    focusBeforeWarning.current?.focus();
    focusBeforeWarning.current = null;
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      label="Check-in"
      title="Still there?"
      description="The screen clears soon to keep your details private."
      onClose={onStillHere}
      hideClose
      centered
    >
      <div className={styles.content}>
        <p className={styles.countdown} aria-hidden="true">
          Clearing the screen in {secondsLeft ?? 0}{" "}
          {secondsLeft === 1 ? "second" : "seconds"}
        </p>
        <PrimaryButton tone="brand" onClick={onStillHere}>
          I&apos;m still here
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default IdleWarning;
