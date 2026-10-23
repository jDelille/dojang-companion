import { getPageMetadata } from "@/config/metadata";
import StaffClient from "./staffClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Staff");
};
export default function Staff() {
  return (
    <>
      <StaffClient />
    </>
  );
}
