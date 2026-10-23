import { getPageMetadata } from "@/config/metadata";
import WorkflowRequestsClient from "./workflowRequestsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Workflow Requests");
};
export default function WorkflowRequests() {
  return (
    <>
      <WorkflowRequestsClient />
    </>
  );
}
