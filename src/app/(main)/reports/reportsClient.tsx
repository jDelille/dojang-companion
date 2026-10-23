
"use client";

import dynamic from "next/dynamic";

const ReportsComponent = dynamic(
  () => import("@/views/finance/reports"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ReportsClient() {
  return <ReportsComponent />;
}
