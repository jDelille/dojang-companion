import { getPageMetadata } from "@/config/metadata";
import UiButtonsGroupClient from "./uiButtonsGroupClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Buttons Group");
};
export default function UiButtonsGroup() {
  return (
    <>
      <UiButtonsGroupClient />
    </>
  );
}
