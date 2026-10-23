import { getPageMetadata } from "@/config/metadata";
import WorkflowApprovalsClient from "./workflowApprovalsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Workflow Approvals");
};
export default function WorkflowApprovals() {
  return (
    <>
      <WorkflowApprovalsClient />
    </>
  );
}
