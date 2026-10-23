
"use client";

import dynamic from "next/dynamic";

const AnalyticsComponent = dynamic(
  () => import("@/views/finance/analytics"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function AnalyticsClient() {
  return <AnalyticsComponent />;
}
