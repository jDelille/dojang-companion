import { getPageMetadata } from "@/config/metadata";
import LeadsClient from "./leadsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Leads");
};
export default function Leads() {
  return (
    <>
      <LeadsClient />
    </>
  );
}
