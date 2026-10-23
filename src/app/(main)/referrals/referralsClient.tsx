
"use client";

import dynamic from "next/dynamic";

const ReferralsComponent = dynamic(
  () => import("@/views/members/referrals"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ReferralsClient() {
  return <ReferralsComponent />;
}
