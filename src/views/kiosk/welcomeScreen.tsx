"use client";

import { useEffect, useState } from "react";
import { greetingFor } from "@/domain/kiosk/greeting";
import type { SecondaryAction } from "@/domain/kiosk/kioskConfig";

// K01 Welcome. Ported from Companion's components/kiosk/screens/welcome-screen.
// Not here yet: "Ask a question" and "Get help from staff". In Companion both
// open the Concierge, which isn't part of DreamOS.

type WelcomeScreenProps = {
  schoolName: string;
  actions: SecondaryAction[]; // from kioskConfig; hidden ones are skipped
  onCheckIn: () => void; // just reports the tap, the flow decides what's next
};

// Good Morning / Afternoon / Evening. The kiosk can sit on this screen for hours.
const Greeting = () => {
  const [greeting, setGreeting] = useState(() => greetingFor(new Date().getHours()));

  useEffect(() => {
    const timer = setInterval(() => setGreeting(greetingFor(new Date().getHours())), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="font-(family-name:--kiosk-font-label) text-[11px] font-medium tracking-[0.16em] text-(--kiosk-muted) uppercase">
      {greeting}
    </p>
  );
};

// Secondary row card: title, short description, arrow in a circle.
// Not available: dashed and see-through, no arrow, so it doesn't look tappable.
const ActionCard = ({
  label,
  description,
  disabled,
  onClick,
}: {
  label: string;
  description: string;
  disabled: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative flex min-h-[104px] flex-1 cursor-pointer flex-col justify-center gap-1.5 rounded-2xl border border-(--kiosk-line) bg-(--kiosk-panel) py-6 pr-[72px] pl-6 text-left text-(--kiosk-text) transition-colors hover:border-(--kiosk-text-secondary) hover:bg-(--kiosk-raised) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--kiosk-text-secondary) active:border-(--kiosk-text-secondary) active:bg-(--kiosk-raised) disabled:cursor-default disabled:border-dashed disabled:bg-transparent disabled:pr-6 disabled:text-(--kiosk-muted)"
    >
      <span className="text-2xl font-semibold">{label}</span>
      <span className="text-base leading-[1.45] text-(--kiosk-text-secondary) group-disabled:text-(--kiosk-muted)">
        {description}
      </span>
      {!disabled && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 right-[18px] grid size-8 -translate-y-1/2 place-items-center rounded-full border border-(--kiosk-line) text-base text-(--kiosk-text-secondary) group-hover:border-(--kiosk-text-secondary) group-hover:bg-(--kiosk-interactive) group-hover:text-(--kiosk-text)"
        >
          →
        </span>
      )}
    </button>
  );
};

const WelcomeScreen = ({ schoolName, actions, onCheckIn }: WelcomeScreenProps) => {
  // Testing / Schedule / Staff are hidden until enabled (kioskConfig), so only cards show
  const cardActions = actions.filter(
    (action) => action.shown && action.prominence === "card",
  );

  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <div className="flex flex-col gap-2.5">
        <Greeting />
        <h1 className="text-[2.25rem] leading-[1.1] font-bold tracking-[-0.04em] @min-[540px]:text-[3.5rem]">
          Welcome to {schoolName}
        </h1>
        <p className="text-lg text-(--kiosk-text-secondary)">What would you like to do today?</p>
      </div>

      {/* Check in: the one dominant action. Full width, tall, red; label left, arrow right. */}
      <button
        type="button"
        onClick={onCheckIn}
        className="mt-10 flex min-h-24 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-(--kiosk-brand) px-7 text-[26px] font-semibold text-(--kiosk-text) transition-[background-color,transform] duration-180 ease-out hover:bg-(--kiosk-brand-bright) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--kiosk-text-secondary) active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Check in
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12h14m-6-6 6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Classes reuses the same live session selection. Events isn't connected yet. */}
      {cardActions.length > 0 && (
        // Phones: the cards stack instead of squeezing side by side
        <div className="mt-3 flex w-full flex-col items-stretch gap-3 @min-[540px]:flex-row">
          {cardActions.map((action) => {
            const isClasses = action.id === "classes";
            const available = isClasses && action.available;
            return (
              <ActionCard
                key={action.id}
                label={action.label}
                description={available ? "View today’s sessions and check in" : "Not connected"}
                disabled={!available}
                onClick={available ? onCheckIn : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
