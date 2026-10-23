
"use client";

import dynamic from "next/dynamic";

const UiBreadcrumbComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiBreadcrumb"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiBreadcrumbClient() {
  return <UiBreadcrumbComponent />;
}
