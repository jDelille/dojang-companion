
"use client";

import dynamic from "next/dynamic";

const WorkoutsComponent = dynamic(
  () => import("@/views/fitness/workouts"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function WorkoutsClient() {
  return <WorkoutsComponent />;
}
