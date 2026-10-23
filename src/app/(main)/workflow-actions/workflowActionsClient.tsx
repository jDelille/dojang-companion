
"use client";

import dynamic from "next/dynamic";

const WorkflowActionsComponent = dynamic(
  () => import("@/views/main-pages/application-pages/workflowActions"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function WorkflowActionsClient() {
  return <WorkflowActionsComponent />;
}
