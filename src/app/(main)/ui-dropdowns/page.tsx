import { getPageMetadata } from "@/config/metadata";
import UiDropdownsClient from "./uiDropdownsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Dropdowns");
};
export default function UiDropdowns() {
  return (
    <>
      <UiDropdownsClient />
    </>
  );
}
