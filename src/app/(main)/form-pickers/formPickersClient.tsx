
"use client";

import dynamic from "next/dynamic";

const FormPickersComponent = dynamic(
  () => import("@/views/ui-interface/forms/formPickers"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function FormPickersClient() {
  return <FormPickersComponent />;
}
