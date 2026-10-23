
"use client";

import dynamic from "next/dynamic";

const UiAccordionComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiAccordion"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiAccordionClient() {
  return <UiAccordionComponent />;
}
