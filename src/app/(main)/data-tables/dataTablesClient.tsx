
"use client";

import dynamic from "next/dynamic";

const DataTablesComponent = dynamic(
  () => import("@/views/ui-interface/tables/dataTables"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function DataTablesClient() {
  return <DataTablesComponent />;
}
