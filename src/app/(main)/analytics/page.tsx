import { getPageMetadata } from "@/config/metadata";
import AnalyticsClient from "./analyticsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Analytics");
};
export default function Analytics() {
  return (
    <>
      <AnalyticsClient />
    </>
  );
}
