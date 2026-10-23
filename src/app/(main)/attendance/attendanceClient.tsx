
"use client";

import dynamic from "next/dynamic";

const AttendanceComponent = dynamic(
  () => import("@/views/members/attendance"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function AttendanceClient() {
  return <AttendanceComponent />;
}
