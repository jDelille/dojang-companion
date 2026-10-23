
"use client";

import dynamic from "next/dynamic";

const MembershipPlansComponent = dynamic(
  () => import("@/views/members/membershipPlans"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function MembershipPlansClient() {
  return <MembershipPlansComponent />;
}
