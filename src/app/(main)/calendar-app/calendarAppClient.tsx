
"use client";

import dynamic from "next/dynamic";

const CalendarAppComponent = dynamic(
  () => import("@/views/main-pages/application-pages/calendar"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function CalendarAppClient() {
  return <CalendarAppComponent />;
}
