import { getPageMetadata } from "@/config/metadata";
import PtSessionsClient from "./ptSessionsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("PT Sessions");
};
export default function PtSessions() {
  return (
    <>
      <PtSessionsClient />
    </>
  );
}
