
"use client";

import dynamic from "next/dynamic";

const HelpComponent = dynamic(
  () => import("@/views/main-pages/pages/help"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function HelpClient() {
  return <HelpComponent />;
}
