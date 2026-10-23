
"use client";

import dynamic from "next/dynamic";

const CampaignsComponent = dynamic(
  () => import("@/views/members/campaigns"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function CampaignsClient() {
  return <CampaignsComponent />;
}
