
"use client";

import dynamic from "next/dynamic";

const BranchesComponent = dynamic(
  () => import("@/views/facility/branches"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function BranchesClient() {
  return <BranchesComponent />;
}
