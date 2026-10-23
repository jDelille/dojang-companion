
"use client";

import dynamic from "next/dynamic";

const LayoutHiddenComponent = dynamic(
  () => import("@/views/main-pages/layout-demo/layoutHidden"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LayoutHiddenClient() {
  return <LayoutHiddenComponent />;
}
