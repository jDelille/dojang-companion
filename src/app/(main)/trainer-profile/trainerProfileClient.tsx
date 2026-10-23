
"use client";

import dynamic from "next/dynamic";

const TrainerProfileComponent = dynamic(
  () => import("@/views/fitness/trainerProfile"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function TrainerProfileClient() {
  return <TrainerProfileComponent />;
}
