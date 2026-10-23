import { getPageMetadata } from "@/config/metadata";
import PaymentsClient from "./paymentsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Payments");
};
export default function Payments() {
  return (
    <>
      <PaymentsClient />
    </>
  );
}
