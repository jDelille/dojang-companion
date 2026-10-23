
"use client";

import dynamic from "next/dynamic";

const WorkflowRequestsComponent = dynamic(
  () => import("@/views/main-pages/application-pages/workflowRequests"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function WorkflowRequestsClient() {
  return <WorkflowRequestsComponent />;
}
