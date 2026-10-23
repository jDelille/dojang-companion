
"use client";

import dynamic from "next/dynamic";

const WorkflowApprovalLevelsComponent = dynamic(
  () => import("@/views/main-pages/application-pages/workflowApprovalLevels"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function WorkflowApprovalLevelsClient() {
  return <WorkflowApprovalLevelsComponent />;
}
