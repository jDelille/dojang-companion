
"use client";

import dynamic from "next/dynamic";

const UiGridComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiGrid"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiGridClient() {
  return <UiGridComponent />;
}
