import { getPageMetadata } from "@/config/metadata";
import DayPassesClient from "./dayPassesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Day Passes");
};
export default function DayPasses() {
  return (
    <>
      <DayPassesClient />
    </>
  );
}
