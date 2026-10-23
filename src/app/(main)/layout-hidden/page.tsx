import { getPageMetadata } from "@/config/metadata";
import LayoutHiddenClient from "./layoutHiddenClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Layout Hidden");
};
export default function LayoutHidden() {
  return (
    <>
      <LayoutHiddenClient />
    </>
  );
}
