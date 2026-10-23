
"use client";

import dynamic from "next/dynamic";

const OrdersComponent = dynamic(
  () => import("@/views/sales/orders"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function OrdersClient() {
  return <OrdersComponent />;
}
