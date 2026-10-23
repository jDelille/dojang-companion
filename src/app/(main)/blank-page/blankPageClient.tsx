
"use client";

import dynamic from "next/dynamic";

const BlankPageComponent = dynamic(
  () => import("@/views/main-pages/pages/blankPage"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function BlankPageClient() {
  return <BlankPageComponent />;
}
