
"use client";

import dynamic from "next/dynamic";

const UiTypographyComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiTypography"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiTypographyClient() {
  return <UiTypographyComponent />;
}
