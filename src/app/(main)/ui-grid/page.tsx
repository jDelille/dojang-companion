import { getPageMetadata } from "@/config/metadata";
import UiGridClient from "./uiGridClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Grid");
};
export default function UiGrid() {
  return (
    <>
      <UiGridClient />
    </>
  );
}
