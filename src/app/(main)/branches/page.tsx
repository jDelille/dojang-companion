import { getPageMetadata } from "@/config/metadata";
import BranchesClient from "./branchesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Branches");
};
export default function Branches() {
  return (
    <>
      <BranchesClient />
    </>
  );
}
