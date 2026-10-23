
"use client";

import dynamic from "next/dynamic";

const RenewalsComponent = dynamic(
  () => import("@/views/members/renewals"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function RenewalsClient() {
  return <RenewalsComponent />;
}
