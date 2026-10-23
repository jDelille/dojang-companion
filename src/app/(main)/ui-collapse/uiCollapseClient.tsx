
"use client";

import dynamic from "next/dynamic";

const UiCollapseComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiCollapse"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiCollapseClient() {
  return <UiCollapseComponent />;
}
