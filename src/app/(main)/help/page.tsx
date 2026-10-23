import { getPageMetadata } from "@/config/metadata";
import HelpClient from "./helpClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Help & Support");
};
export default function Help() {
  return (
    <>
      <HelpClient />
    </>
  );
}
