
"use client";

import dynamic from "next/dynamic";

const WorkflowApprovalsComponent = dynamic(
  () => import("@/views/main-pages/application-pages/workflowApprovals"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function WorkflowApprovalsClient() {
  return <WorkflowApprovalsComponent />;
}
