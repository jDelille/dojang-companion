
"use client";

import dynamic from "next/dynamic";

const TrainersComponent = dynamic(
  () => import("@/views/fitness/trainers"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function TrainersClient() {
  return <TrainersComponent />;
}
