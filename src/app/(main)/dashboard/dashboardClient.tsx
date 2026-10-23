
"use client";

import dynamic from "next/dynamic";

const DashboardComponent = dynamic(
  () => import("@/views/main-pages/dashboard/dashboard"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function DashboardClient() {
  return <DashboardComponent />;
}
