import { getPageMetadata } from "@/config/metadata";
import UiBreadcrumbClient from "./uiBreadcrumbClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Breadcrumb");
};
export default function UiBreadcrumb() {
  return (
    <>
      <UiBreadcrumbClient />
    </>
  );
}
