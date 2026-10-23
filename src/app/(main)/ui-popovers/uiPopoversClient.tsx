
"use client";

import dynamic from "next/dynamic";

const UiPopoversComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiPopovers"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiPopoversClient() {
  return <UiPopoversComponent />;
}
