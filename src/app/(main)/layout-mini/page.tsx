import { getPageMetadata } from "@/config/metadata";
import LayoutMiniClient from "./layoutMiniClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Layout Mini");
};
export default function LayoutMini() {
  return (
    <>
      <LayoutMiniClient />
    </>
  );
}
