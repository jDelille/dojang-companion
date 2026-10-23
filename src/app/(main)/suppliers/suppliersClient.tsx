
"use client";

import dynamic from "next/dynamic";

const SuppliersComponent = dynamic(
  () => import("@/views/inventory/suppliers"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function SuppliersClient() {
  return <SuppliersComponent />;
}
