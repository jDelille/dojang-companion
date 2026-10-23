import { getPageMetadata } from "@/config/metadata";
import OffersClient from "./offersClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Offers");
};
export default function Offers() {
  return (
    <>
      <OffersClient />
    </>
  );
}
