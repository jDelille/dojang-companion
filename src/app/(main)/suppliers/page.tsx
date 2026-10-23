import { getPageMetadata } from "@/config/metadata";
import SuppliersClient from "./suppliersClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Suppliers");
};
export default function Suppliers() {
  return (
    <>
      <SuppliersClient />
    </>
  );
}
