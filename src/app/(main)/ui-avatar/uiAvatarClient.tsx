
"use client";

import dynamic from "next/dynamic";

const UiAvatarComponent = dynamic(
  () => import("@/views/ui-interface/base-ui/uiAvatar"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function UiAvatarClient() {
  return <UiAvatarComponent />;
}
