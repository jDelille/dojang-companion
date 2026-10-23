
"use client";

import dynamic from "next/dynamic";

const ForgotPasswordComponent = dynamic(
  () => import("@/views/auth-pages/forgotPassword"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ForgotPasswordClient() {
  return <ForgotPasswordComponent />;
}
