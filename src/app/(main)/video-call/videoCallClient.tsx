
"use client";

import dynamic from "next/dynamic";

const VideoCallComponent = dynamic(
  () => import("@/views/main-pages/application-pages/videoCall"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function VideoCallClient() {
  return <VideoCallComponent />;
}
