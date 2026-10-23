import { getPageMetadata } from "@/config/metadata";
import BlankPageClient from "./blankPageClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Blank Page");
};
export default function BlankPage() {
  return (
    <>
      <BlankPageClient />
    </>
  );
}
