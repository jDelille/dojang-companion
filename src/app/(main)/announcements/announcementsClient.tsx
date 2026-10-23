
"use client";

import dynamic from "next/dynamic";

const AnnouncementsComponent = dynamic(
  () => import("@/views/facility/announcements"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function AnnouncementsClient() {
  return <AnnouncementsComponent />;
}
