
"use client";

import dynamic from "next/dynamic";

const PayrollComponent = dynamic(
  () => import("@/views/finance/payroll"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function PayrollClient() {
  return <PayrollComponent />;
}
