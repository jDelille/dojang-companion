
"use client";

import dynamic from "next/dynamic";

const UiProgressComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiProgress"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiProgressClient() {
  return <UiProgressComponent />;
}
