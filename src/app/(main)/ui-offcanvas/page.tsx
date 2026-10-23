import { getPageMetadata } from "@/config/metadata";
import UiOffcanvasClient from "./uiOffcanvasClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Offcanvas");
};
export default function UiOffcanvas() {
  return (
    <>
      <UiOffcanvasClient />
    </>
  );
}
