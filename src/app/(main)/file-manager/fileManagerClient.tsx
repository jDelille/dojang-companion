
"use client";

import dynamic from "next/dynamic";

const FileManagerComponent = dynamic(
  () => import("@/views/main-pages/application-pages/fileManager"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function FileManagerClient() {
  return <FileManagerComponent />;
}
