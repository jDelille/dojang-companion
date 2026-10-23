import { getPageMetadata } from "@/config/metadata";
import FileManagerClient from "./fileManagerClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("File Manager");
};
export default function FileManager() {
  return (
    <>
      <FileManagerClient />
    </>
  );
}
