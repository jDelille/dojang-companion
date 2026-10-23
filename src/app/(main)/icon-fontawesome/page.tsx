import { getPageMetadata } from "@/config/metadata";
import IconFontawesomeClient from "./iconFontawesomeClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Font Awesome Icons");
};
export default function IconFontawesome() {
  return (
    <>
      <IconFontawesomeClient />
    </>
  );
}
