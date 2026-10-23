
"use client";

import dynamic from "next/dynamic";

const ChatAppComponent = dynamic(
  () => import("@/views/main-pages/application-pages/chat"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ChatAppClient() {
  return <ChatAppComponent />;
}
