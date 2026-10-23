
"use client";

import dynamic from "next/dynamic";

const UiImagesComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiImages"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiImagesClient() {
  return <UiImagesComponent />;
}
