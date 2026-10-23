
"use client";

import dynamic from "next/dynamic";

const IconLucideComponent = dynamic(
  () => import("@/views/ui-interface/icons/iconLucide"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function IconLucideClient() {
  return <IconLucideComponent />;
}
