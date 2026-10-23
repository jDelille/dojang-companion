
"use client";

import dynamic from "next/dynamic";

const FormElementsComponent = dynamic(
  () => import("@/views/ui-interface/forms/formElements"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function FormElementsClient() {
  return <FormElementsComponent />;
}
