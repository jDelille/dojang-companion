
"use client";

import dynamic from "next/dynamic";

const IconPhosphorComponent = dynamic(
  () => import("@/views/ui-interface/icons/iconPhosphor"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function IconPhosphorClient() {
  return <IconPhosphorComponent />;
}
