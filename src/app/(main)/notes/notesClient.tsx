
"use client";

import dynamic from "next/dynamic";

const NotesComponent = dynamic(
  () => import("@/views/main-pages/application-pages/notes"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function NotesClient() {
  return <NotesComponent />;
}
