import { getPageMetadata } from "@/config/metadata";
import ComingSoonClient from "./comingSoonClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Coming Soon");
};
export default function ComingSoon() {
  return (
    <>
      <ComingSoonClient />
    </>
  );
}
