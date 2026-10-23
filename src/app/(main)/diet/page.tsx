import { getPageMetadata } from "@/config/metadata";
import DietClient from "./dietClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Diet");
};
export default function Diet() {
  return (
    <>
      <DietClient />
    </>
  );
}
