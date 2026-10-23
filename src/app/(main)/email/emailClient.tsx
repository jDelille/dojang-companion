
"use client";

import dynamic from "next/dynamic";

const EmailComponent = dynamic(
  () => import("@/views/main-pages/application-pages/email"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function EmailClient() {
  return <EmailComponent />;
}
