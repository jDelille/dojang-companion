
"use client";

import dynamic from "next/dynamic";

const ChallengesComponent = dynamic(
  () => import("@/views/members/challenges"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ChallengesClient() {
  return <ChallengesComponent />;
}
