
"use client";

import dynamic from "next/dynamic";

const SettingsComponent = dynamic(
  () => import("@/views/facility/settings"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function SettingsClient() {
  return <SettingsComponent />;
}
