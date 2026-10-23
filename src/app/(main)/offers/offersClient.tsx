
"use client";

import dynamic from "next/dynamic";

const OffersComponent = dynamic(
  () => import("@/views/sales/offers"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function OffersClient() {
  return <OffersComponent />;
}
