import { getPageMetadata } from "@/config/metadata";
import IconPhosphorClient from "./iconPhosphorClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Phosphor Icons");
};
export default function IconPhosphor() {
  return (
    <>
      <IconPhosphorClient />
    </>
  );
}
