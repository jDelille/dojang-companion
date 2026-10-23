
"use client";

import dynamic from "next/dynamic";

const Error500Component = dynamic(
  () => import("@/views/main-pages/pages/error500"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function Error500Client() {
  return <Error500Component />;
}
