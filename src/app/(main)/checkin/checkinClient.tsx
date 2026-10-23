
"use client";

import dynamic from "next/dynamic";

const CheckinComponent = dynamic(
  () => import("@/views/members/checkin"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function CheckinClient() {
  return <CheckinComponent />;
}
