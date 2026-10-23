import { getPageMetadata } from "@/config/metadata";
import WorkflowActionsClient from "./workflowActionsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Workflow Actions");
};
export default function WorkflowActions() {
  return (
    <>
      <WorkflowActionsClient />
    </>
  );
}
