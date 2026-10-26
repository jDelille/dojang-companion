"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";

// "Still there?" shown in the last seconds before the privacy reset (K07).
// Ported from Companion's components/kiosk/idle-warning/IdleWarning.tsx and its
// primitives/modal (a native <dialog>, centered, no small close button).

type IdleWarningProps = {
  secondsLeft: number | null;
  onStillHere: () => void;
};

const IdleWarning = ({ secondsLeft, onStillHere }: IdleWarningProps) => {
  const isOpen = secondsLeft !== null;
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

  // Give focus back to where it was (e.g. the search field) after "I'm still here"
  const focusBeforeWarning = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (isOpen) focusBeforeWarning.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
    if (!isOpen) {
      focusBeforeWarning.current?.focus();
      focusBeforeWarning.current = null;
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        // Escape: same as "I'm still here", the parent closes it
        event.preventDefault();
        onStillHere();
      }}
      onClick={(event) => event.target === dialog.current && onStillHere()} // tap outside
      className="m-auto w-[min(560px,calc(100%-2rem))] rounded-2xl border border-(--kiosk-line) bg-(--kiosk-panel) p-0 text-(--kiosk-text) backdrop:bg-[#08080a]/60 backdrop:backdrop-blur-[6px]"
    >
      <header className="border-b border-(--kiosk-line) px-[22px] py-[18px]">
        <span className="mb-1.5 block font-(family-name:--kiosk-font-label) text-[10px] font-medium tracking-[0.16em] text-(--kiosk-muted) uppercase">
          Check-in
        </span>
        <h2 id={`${id}-title`} className="text-xl font-semibold">
          Still there?
        </h2>
        <p id={`${id}-description`} className="mt-1 text-[13px] leading-[1.6] text-(--kiosk-text-secondary)">
          The screen clears soon to keep your details private.
        </p>
      </header>

      <div className="flex flex-col gap-5 px-[22px] pt-5 pb-[22px]">
        {/* Hidden from screen readers so they aren't read a number every second */}
        <p className="text-xl font-semibold tabular-nums" aria-hidden="true">
          Clearing the screen in {secondsLeft ?? 0} {secondsLeft === 1 ? "second" : "seconds"}
        </p>
        <button
          type="button"
          onClick={onStillHere}
          className="flex min-h-20 w-full cursor-pointer items-center justify-center rounded-2xl bg-(--kiosk-brand) px-8 text-[1.875rem] font-semibold text-(--kiosk-text) transition-colors hover:bg-(--kiosk-brand-bright) focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--kiosk-text-secondary) active:bg-(--kiosk-brand-bright)"
        >
          I&apos;m still here
        </button>
      </div>
    </dialog>
  );
};

export default IdleWarning;
