
"use client";

import dynamic from "next/dynamic";

const UiColorsComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiColors"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiColorsClient() {
  return <UiColorsComponent />;
}
