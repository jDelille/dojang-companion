
"use client";

import dynamic from "next/dynamic";

const ComingSoonComponent = dynamic(
  () => import("@/views/main-pages/pages/comingSoon"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ComingSoonClient() {
  return <ComingSoonComponent />;
}
