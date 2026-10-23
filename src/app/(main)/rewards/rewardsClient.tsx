
"use client";

import dynamic from "next/dynamic";

const RewardsComponent = dynamic(
  () => import("@/views/members/rewards"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function RewardsClient() {
  return <RewardsComponent />;
}
