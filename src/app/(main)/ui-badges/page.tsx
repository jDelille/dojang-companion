import { getPageMetadata } from "@/config/metadata";
import UiBadgesClient from "./uiBadgesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Badges");
};
export default function UiBadges() {
  return (
    <>
      <UiBadgesClient />
    </>
  );
}
