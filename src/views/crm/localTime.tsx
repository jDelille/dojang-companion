"use client";

import { useSyncExternalStore } from "react";

// Times shown in the viewer's own time zone, worked out in the browser only
// (the server renders an empty label first), like Companion's DayLabel.

const noSubscription = () => () => {};

function useBrowserText(format: () => string) {
  return useSyncExternalStore(noSubscription, format, () => "");
}

// "Today, 4:15 PM" or "Oct 25, 5:00 PM"
export function TimeLabel({ iso }: { iso: string }) {
  const text = useBrowserText(() => {
    const time = new Date(iso);
    const clock = time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (time.toDateString() === new Date().toDateString()) return `Today, ${clock}`;
    const day = time.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${day}, ${clock}`;
  });
  return <time dateTime={iso}>{text}</time>;
}

// A due date with no time ("2026-10-29") -> "Oct 29"
export function DateLabel({ date }: { date: string }) {
  const text = useBrowserText(() =>
    new Date(`${date}T12:00:00`).toLocaleDateString([], { month: "short", day: "numeric" }),
  );
  return <time dateTime={date}>{text}</time>;
}
