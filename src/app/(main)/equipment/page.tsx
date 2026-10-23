import { getPageMetadata } from "@/config/metadata";
import EquipmentClient from "./equipmentClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Equipment");
};
export default function Equipment() {
  return (
    <>
      <EquipmentClient />
    </>
  );
}
