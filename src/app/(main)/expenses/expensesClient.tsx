
"use client";

import dynamic from "next/dynamic";

const ExpensesComponent = dynamic(
  () => import("@/views/finance/expenses"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ExpensesClient() {
  return <ExpensesComponent />;
}
