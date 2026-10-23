
"use client";

import dynamic from "next/dynamic";

const UiDragulaComponent = dynamic(
  () => import("@/views/ui-interface/advanced-ui/uiDragula"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiDragulaClient() {
  return <UiDragulaComponent />;
}
