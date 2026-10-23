
"use client";

import dynamic from "next/dynamic";

const UiDropdownsComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiDropdowns"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiDropdownsClient() {
  return <UiDropdownsComponent />;
}
