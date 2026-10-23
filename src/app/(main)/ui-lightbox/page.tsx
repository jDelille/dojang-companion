import { getPageMetadata } from "@/config/metadata";
import UiLightboxClient from "./uiLightboxClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Lightbox");
};
export default function UiLightbox() {
  return (
    <>
      <UiLightboxClient />
    </>
  );
}
