
"use client";

import dynamic from "next/dynamic";

const UiCardsComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiCards"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiCardsClient() {
  return <UiCardsComponent />;
}
