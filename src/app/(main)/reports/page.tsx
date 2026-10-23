import { getPageMetadata } from "@/config/metadata";
import ReportsClient from "./reportsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Reports");
};
export default function Reports() {
  return (
    <>
      <ReportsClient />
    </>
  );
}
