import { getPageMetadata } from "@/config/metadata";
import DataTablesClient from "./dataTablesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Data Tables");
};
export default function DataTables() {
  return (
    <>
      <DataTablesClient />
    </>
  );
}
