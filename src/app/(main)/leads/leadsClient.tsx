
"use client";

import dynamic from "next/dynamic";

const LeadsComponent = dynamic(
  () => import("@/views/members/leads"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LeadsClient() {
  return <LeadsComponent />;
}
