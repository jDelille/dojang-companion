
"use client";

import dynamic from "next/dynamic";

const UiModalsComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiModals"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiModalsClient() {
  return <UiModalsComponent />;
}
