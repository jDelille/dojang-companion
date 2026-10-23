
"use client";

import dynamic from "next/dynamic";

const UiButtonsGroupComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiButtonsGroup"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiButtonsGroupClient() {
  return <UiButtonsGroupComponent />;
}
