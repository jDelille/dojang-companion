
"use client";

import dynamic from "next/dynamic";

const InvoicesComponent = dynamic(
  () => import("@/views/sales/invoices"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function InvoicesClient() {
  return <InvoicesComponent />;
}
