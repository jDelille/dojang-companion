
"use client";

import dynamic from "next/dynamic";

const UiNavTabsComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiNavTabs"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiNavTabsClient() {
  return <UiNavTabsComponent />;
}
