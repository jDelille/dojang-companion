import { getPageMetadata } from "@/config/metadata";
import AccessControlClient from "./accessControlClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Access Control");
};
export default function AccessControl() {
  return (
    <>
      <AccessControlClient />
    </>
  );
}
