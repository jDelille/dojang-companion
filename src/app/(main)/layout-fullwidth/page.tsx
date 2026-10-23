import { getPageMetadata } from "@/config/metadata";
import LayoutFullWidthClient from "./layoutFullWidthClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Layout Full Width");
};
export default function LayoutFullWidth() {
  return (
    <>
      <LayoutFullWidthClient />
    </>
  );
}
