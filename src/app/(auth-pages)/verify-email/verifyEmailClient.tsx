
"use client";

import dynamic from "next/dynamic";

const VerifyEmailComponent = dynamic(
  () => import("@/views/auth-pages/verifyEmail"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function VerifyEmailClient() {
  return <VerifyEmailComponent />;
}
