
"use client";

import dynamic from "next/dynamic";

const ClassesComponent = dynamic(
  () => import("@/views/fitness/classes"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ClassesClient() {
  return <ClassesComponent />;
}
