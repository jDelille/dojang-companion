import { getPageMetadata } from "@/config/metadata";
import UiClipboardClient from "./uiClipboardClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Clipboard");
};
export default function UiClipboard() {
  return (
    <>
      <UiClipboardClient />
    </>
  );
}
