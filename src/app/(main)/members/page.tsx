import { getPageMetadata } from "@/config/metadata";
import MembersClient from "./membersClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Members");
};
export default function Members() {
  return (
    <>
      <MembersClient />
    </>
  );
}
