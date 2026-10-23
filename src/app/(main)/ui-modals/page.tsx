import { getPageMetadata } from "@/config/metadata";
import UiModalsClient from "./uiModalsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Modals");
};
export default function UiModals() {
  return (
    <>
      <UiModalsClient />
    </>
  );
}
