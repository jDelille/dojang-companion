
"use client";

import dynamic from "next/dynamic";

const UiButtonsComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiButtons"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiButtonsClient() {
  return <UiButtonsComponent />;
}
