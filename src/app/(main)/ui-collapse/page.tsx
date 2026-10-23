import { getPageMetadata } from "@/config/metadata";
import UiCollapseClient from "./uiCollapseClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Collapse");
};
export default function UiCollapse() {
  return (
    <>
      <UiCollapseClient />
    </>
  );
}
