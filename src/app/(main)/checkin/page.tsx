import { getPageMetadata } from "@/config/metadata";
import CheckinClient from "./checkinClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Check-in");
};
export default function Checkin() {
  return (
    <>
      <CheckinClient />
    </>
  );
}
