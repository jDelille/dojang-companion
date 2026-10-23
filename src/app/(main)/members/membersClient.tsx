
"use client";

import dynamic from "next/dynamic";

const MembersComponent = dynamic(
  () => import("@/views/members/members"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function MembersClient() {
  return <MembersComponent />;
}
