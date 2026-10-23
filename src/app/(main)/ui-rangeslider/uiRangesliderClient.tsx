
"use client";

import dynamic from "next/dynamic";

const UiRangesliderComponent = dynamic(
  () => import("@/views/ui-interface/advanced-ui/uiRangeslider"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiRangesliderClient() {
  return <UiRangesliderComponent />;
}
