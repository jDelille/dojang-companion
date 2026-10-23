import { getPageMetadata } from "@/config/metadata";
import IconLucideClient from "./iconLucideClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Lucide Icons");
};
export default function IconLucide() {
  return (
    <>
      <IconLucideClient />
    </>
  );
}
