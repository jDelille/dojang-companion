
"use client";

import dynamic from "next/dynamic";

const MemberProfileComponent = dynamic(
  () => import("@/views/members/memberProfile"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function MemberProfileClient() {
  return <MemberProfileComponent />;
}
