import { getPageMetadata } from "@/config/metadata";
import UiDragulaClient from "./uiDragulaClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Dragula");
};
export default function UiDragula() {
  return (
    <>
      <UiDragulaClient />
    </>
  );
}
