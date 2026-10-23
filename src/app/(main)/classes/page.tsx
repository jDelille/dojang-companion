import { getPageMetadata } from "@/config/metadata";
import ClassesClient from "./classesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Classes");
};
export default function Classes() {
  return (
    <>
      <ClassesClient />
    </>
  );
}
