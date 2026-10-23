
"use client";

import dynamic from "next/dynamic";

const ChartApexComponent = dynamic(
  () => import("@/views/ui-interface/charts/chartApex"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ChartApexClient() {
  return <ChartApexComponent />;
}
