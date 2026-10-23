import { getPageMetadata } from "@/config/metadata";
import UiButtonsClient from "./uiButtonsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Buttons");
};
export default function UiButtons() {
  return (
    <>
      <UiButtonsClient />
    </>
  );
}
