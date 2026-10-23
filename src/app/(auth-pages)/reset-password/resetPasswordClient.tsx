
"use client";

import dynamic from "next/dynamic";

const ResetPasswordComponent = dynamic(
  () => import("@/views/auth-pages/resetPassword"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ResetPasswordClient() {
  return <ResetPasswordComponent />;
}
