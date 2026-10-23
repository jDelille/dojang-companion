
"use client";

import dynamic from "next/dynamic";

const ChartJsComponent = dynamic(
  () => import("@/views/ui-interface/charts/chartJs"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ChartJsClient() {
  return <ChartJsComponent />;
}
