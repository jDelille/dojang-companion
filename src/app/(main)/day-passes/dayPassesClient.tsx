
"use client";

import dynamic from "next/dynamic";

const DayPassesComponent = dynamic(
  () => import("@/views/members/dayPasses"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function DayPassesClient() {
  return <DayPassesComponent />;
}
