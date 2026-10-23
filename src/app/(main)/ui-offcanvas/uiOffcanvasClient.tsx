
"use client";

import dynamic from "next/dynamic";

const UiOffcanvasComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiOffcanvas"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiOffcanvasClient() {
  return <UiOffcanvasComponent />;
}
