
"use client";

import dynamic from "next/dynamic";

const LayoutHoverviewComponent = dynamic(
  () => import("@/views/main-pages/layout-demo/layoutHoverview"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LayoutHoverviewClient() {
  return <LayoutHoverviewComponent />;
}
