
"use client";

import dynamic from "next/dynamic";

const AccessControlComponent = dynamic(
  () => import("@/views/facility/accessControl"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function AccessControlClient() {
  return <AccessControlComponent />;
}
