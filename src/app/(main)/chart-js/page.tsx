import { getPageMetadata } from "@/config/metadata";
import ChartJsClient from "./chartJsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Chart JS");
};
export default function ChartJs() {
  return (
    <>
      <ChartJsClient />
    </>
  );
}
