
"use client";

import dynamic from "next/dynamic";

const UiClipboardComponent = dynamic(
  () => import("@/views/ui-interface/advanced-ui/uiClipboard"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiClipboardClient() {
  return <UiClipboardComponent />;
}
