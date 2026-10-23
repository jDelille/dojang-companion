
"use client";

import dynamic from "next/dynamic";

const UiLightboxComponent = dynamic(
  () => import("@/views/ui-interface/advanced-ui/uiLightbox"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiLightboxClient() {
  return <UiLightboxComponent />;
}
