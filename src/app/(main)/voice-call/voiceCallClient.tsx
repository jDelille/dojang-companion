
"use client";

import dynamic from "next/dynamic";

const VoiceCallComponent = dynamic(
  () => import("@/views/main-pages/application-pages/voiceCall"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function VoiceCallClient() {
  return <VoiceCallComponent />;
}
