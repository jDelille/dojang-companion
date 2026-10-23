
"use client";

import dynamic from "next/dynamic";

const LoginComponent = dynamic(
  () => import("@/views/auth-pages/login"),
  { 
    ssr: false,
    loading: () => <p></p>
  }
);

export default function LoginClient() {
  return <LoginComponent />;
}