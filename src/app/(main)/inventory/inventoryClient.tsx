
"use client";

import dynamic from "next/dynamic";

const InventoryComponent = dynamic(
  () => import("@/views/inventory/inventory"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function InventoryClient() {
  return <InventoryComponent />;
}
