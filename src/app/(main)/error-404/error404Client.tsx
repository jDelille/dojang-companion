
"use client";

import dynamic from "next/dynamic";

const Error404Component = dynamic(
  () => import("@/views/main-pages/pages/error404"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function Error404Client() {
  return <Error404Component />;
}
