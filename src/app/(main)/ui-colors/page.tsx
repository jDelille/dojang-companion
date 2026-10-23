import { getPageMetadata } from "@/config/metadata";
import UiColorsClient from "./uiColorsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Colors");
};
export default function UiColors() {
  return (
    <>
      <UiColorsClient />
    </>
  );
}
