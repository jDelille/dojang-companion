
"use client";

import dynamic from "next/dynamic";

const IconTablerComponent = dynamic(
  () => import("@/views/ui-interface/icons/iconTabler"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function IconTablerClient() {
  return <IconTablerComponent />;
}
