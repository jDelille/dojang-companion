
"use client";

import dynamic from "next/dynamic";

const Error403Component = dynamic(
  () => import("@/views/main-pages/pages/error403"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function Error403Client() {
  return <Error403Component />;
}
