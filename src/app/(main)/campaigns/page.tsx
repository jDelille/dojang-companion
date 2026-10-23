import { getPageMetadata } from "@/config/metadata";
import CampaignsClient from "./campaignsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Campaigns");
};
export default function Campaigns() {
  return (
    <>
      <CampaignsClient />
    </>
  );
}
