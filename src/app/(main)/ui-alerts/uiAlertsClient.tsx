
"use client";

import dynamic from "next/dynamic";

const UiAlertsComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiAlerts"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiAlertsClient() {
  return <UiAlertsComponent />;
}
