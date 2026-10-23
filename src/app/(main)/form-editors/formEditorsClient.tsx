
"use client";

import dynamic from "next/dynamic";

const FormEditorsComponent = dynamic(
  () => import("@/views/ui-interface/forms/formEditors"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function FormEditorsClient() {
  return <FormEditorsComponent />;
}
