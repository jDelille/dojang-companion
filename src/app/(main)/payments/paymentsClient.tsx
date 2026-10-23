
"use client";

import dynamic from "next/dynamic";

const PaymentsComponent = dynamic(
  () => import("@/views/sales/payments"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function PaymentsClient() {
  return <PaymentsComponent />;
}
