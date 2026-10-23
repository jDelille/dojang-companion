import { getPageMetadata } from "@/config/metadata";
import RenewalsClient from "./renewalsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Renewals");
};
export default function Renewals() {
  return (
    <>
      <RenewalsClient />
    </>
  );
}
