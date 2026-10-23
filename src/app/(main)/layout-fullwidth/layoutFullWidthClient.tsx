
"use client";

import dynamic from "next/dynamic";

const LayoutFullWidthComponent = dynamic(
  () => import("@/views/main-pages/layout-demo/layoutFullWidth"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LayoutFullWidthClient() {
  return <LayoutFullWidthComponent />;
}
