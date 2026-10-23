
"use client";

import dynamic from "next/dynamic";

const LayoutRtlComponent = dynamic(
  () => import("@/views/main-pages/layout-demo/layoutRtl"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LayoutRtlClient() {
  return <LayoutRtlComponent />;
}
