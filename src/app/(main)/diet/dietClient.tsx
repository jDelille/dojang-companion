
"use client";

import dynamic from "next/dynamic";

const DietComponent = dynamic(
  () => import("@/views/fitness/diet"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function DietClient() {
  return <DietComponent />;
}
