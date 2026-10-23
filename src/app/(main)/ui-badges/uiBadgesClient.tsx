
"use client";

import dynamic from "next/dynamic";

const UiBadgesComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiBadges"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiBadgesClient() {
  return <UiBadgesComponent />;
}
