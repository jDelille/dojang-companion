
"use client";

import dynamic from "next/dynamic";

const MaintenanceComponent = dynamic(
  () => import("@/views/main-pages/pages/maintenance"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function MaintenanceClient() {
  return <MaintenanceComponent />;
}
