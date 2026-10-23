
"use client";

import dynamic from "next/dynamic";

const PosComponent = dynamic(
  () => import("@/views/main-pages/pos/pos"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function PosClient() {
  return <PosComponent />;
}
