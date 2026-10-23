import { getPageMetadata } from "@/config/metadata";
import ChartApexClient from "./chartApexClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Chart Apex");
};
export default function ChartApex() {
  return (
    <>
      <ChartApexClient />
    </>
  );
}
