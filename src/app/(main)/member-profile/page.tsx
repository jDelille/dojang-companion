import { getPageMetadata } from "@/config/metadata";
import MemberProfileClient from "./memberProfileClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Member Profile");
};
export default function MemberProfile() {
  return (
    <>
      <MemberProfileClient />
    </>
  );
}
