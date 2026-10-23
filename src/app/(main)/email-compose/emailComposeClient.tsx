
"use client";

import dynamic from "next/dynamic";

const EmailComposeComponent = dynamic(
  () => import("@/views/main-pages/application-pages/emailCompose"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function EmailComposeClient() {
  return <EmailComposeComponent />;
}
