import { getPageMetadata } from "@/config/metadata";
import MembershipPlansClient from "./membershipPlansClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Membership Plans");
};
export default function MembershipPlans() {
  return (
    <>
      <MembershipPlansClient />
    </>
  );
}
