
"use client";

import dynamic from "next/dynamic";

const IconFontawesomeComponent = dynamic(
  () => import("@/views/ui-interface/icons/iconFontawesome"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function IconFontawesomeClient() {
  return <IconFontawesomeComponent />;
}
