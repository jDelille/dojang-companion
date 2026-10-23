
"use client";

import dynamic from "next/dynamic";

const TermsOfServiceComponent = dynamic(
  () => import("@/views/main-pages/pages/termsOfService"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function TermsOfServiceClient() {
  return <TermsOfServiceComponent />;
}
