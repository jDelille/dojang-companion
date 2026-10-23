
"use client";

import dynamic from "next/dynamic";

const UiPaginationComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiPagination"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiPaginationClient() {
  return <UiPaginationComponent />;
}
