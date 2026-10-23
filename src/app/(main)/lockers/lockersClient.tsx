
"use client";

import dynamic from "next/dynamic";

const LockersComponent = dynamic(
  () => import("@/views/facility/lockers"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LockersClient() {
  return <LockersComponent />;
}
