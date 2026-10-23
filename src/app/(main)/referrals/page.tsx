import { getPageMetadata } from "@/config/metadata";
import ReferralsClient from "./referralsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Referrals");
};
export default function Referrals() {
  return (
    <>
      <ReferralsClient />
    </>
  );
}
