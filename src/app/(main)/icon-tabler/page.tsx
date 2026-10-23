import { getPageMetadata } from "@/config/metadata";
import IconTablerClient from "./iconTablerClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Tabler Icons");
};
export default function IconTabler() {
  return (
    <>
      <IconTablerClient />
    </>
  );
}
