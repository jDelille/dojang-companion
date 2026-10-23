
"use client";

import dynamic from "next/dynamic";

const FeedbackComponent = dynamic(
  () => import("@/views/members/feedback"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function FeedbackClient() {
  return <FeedbackComponent />;
}
