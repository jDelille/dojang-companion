
"use client";

import dynamic from "next/dynamic";

const TodoComponent = dynamic(
  () => import("@/views/main-pages/application-pages/todo"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function TodoClient() {
  return <TodoComponent />;
}
