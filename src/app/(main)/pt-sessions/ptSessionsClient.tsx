
"use client";

import dynamic from "next/dynamic";

const PtSessionsComponent = dynamic(
  () => import("@/views/fitness/ptSessions"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function PtSessionsClient() {
  return <PtSessionsComponent />;
}
