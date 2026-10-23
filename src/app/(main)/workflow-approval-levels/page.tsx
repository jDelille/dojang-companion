import { getPageMetadata } from "@/config/metadata";
import WorkflowApprovalLevelsClient from "./workflowApprovalLevelsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Workflow Approval Levels");
};
export default function WorkflowApprovalLevels() {
  return (
    <>
      <WorkflowApprovalLevelsClient />
    </>
  );
}
