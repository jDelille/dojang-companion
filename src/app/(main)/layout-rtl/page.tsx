import { getPageMetadata } from "@/config/metadata";
import LayoutRtlClient from "./layoutRtlClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Layout RTL");
};
export default function LayoutRtl() {
  return (
    <>
      <LayoutRtlClient />
    </>
  );
}
