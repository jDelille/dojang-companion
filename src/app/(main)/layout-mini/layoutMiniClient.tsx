
"use client";

import dynamic from "next/dynamic";

const LayoutMiniComponent = dynamic(
  () => import("@/views/main-pages/layout-demo/layoutMini"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LayoutMiniClient() {
  return <LayoutMiniComponent />;
}
