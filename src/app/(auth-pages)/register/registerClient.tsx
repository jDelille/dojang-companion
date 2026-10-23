
"use client";

import dynamic from "next/dynamic";

const RegisterComponent = dynamic(
  () => import("@/views/auth-pages/register"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function RegisterClient() {
  return <RegisterComponent />;
}
