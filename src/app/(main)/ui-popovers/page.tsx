import { getPageMetadata } from "@/config/metadata";
import UiPopoversClient from "./uiPopoversClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Popovers");
};
export default function UiPopovers() {
  return (
    <>
      <UiPopoversClient />
    </>
  );
}
