
"use client";

import dynamic from "next/dynamic";

const StaffComponent = dynamic(
  () => import("@/views/facility/staff"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function StaffClient() {
  return <StaffComponent />;
}
