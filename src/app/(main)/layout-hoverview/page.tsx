import { getPageMetadata } from "@/config/metadata";
import LayoutHoverviewClient from "./layoutHoverviewClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Layout Hoverview");
};
export default function LayoutHoverview() {
  return (
    <>
      <LayoutHoverviewClient />
    </>
  );
}
