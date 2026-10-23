import { getPageMetadata } from "@/config/metadata";
import UiImagesClient from "./uiImagesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Images");
};
export default function UiImages() {
  return (
    <>
      <UiImagesClient />
    </>
  );
}
