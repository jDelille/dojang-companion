
"use client";

import dynamic from "next/dynamic";

const FormSelect2Component = dynamic(
  () => import("@/views/ui-interface/forms/formSelect2"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function FormSelect2Client() {
  return <FormSelect2Component />;
}
