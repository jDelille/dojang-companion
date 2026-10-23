
"use client";

import dynamic from "next/dynamic";

const TablesBasicComponent = dynamic(
  () => import("@/views/ui-interface/tables/tablesBasic"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function TablesBasicClient() {
  return <TablesBasicComponent />;
}
