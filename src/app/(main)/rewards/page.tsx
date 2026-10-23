import { getPageMetadata } from "@/config/metadata";
import RewardsClient from "./rewardsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Rewards");
};
export default function Rewards() {
  return (
    <>
      <RewardsClient />
    </>
  );
}
