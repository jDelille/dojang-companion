import { getPageMetadata } from "@/config/metadata";
import MaintenanceClient from "./maintenanceClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Maintenance");
};
export default function Maintenance() {
  return (
    <>
      <MaintenanceClient />
    </>
  );
}
