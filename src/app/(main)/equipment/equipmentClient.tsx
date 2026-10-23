
"use client";

import dynamic from "next/dynamic";

const EquipmentComponent = dynamic(
  () => import("@/views/inventory/equipment"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function EquipmentClient() {
  return <EquipmentComponent />;
}
