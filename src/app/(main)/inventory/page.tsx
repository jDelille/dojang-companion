import { getPageMetadata } from "@/config/metadata";
import InventoryClient from "./inventoryClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Inventory");
};
export default function Inventory() {
  return (
    <>
      <InventoryClient />
    </>
  );
}
