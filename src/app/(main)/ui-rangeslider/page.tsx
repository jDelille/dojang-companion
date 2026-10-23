import { getPageMetadata } from "@/config/metadata";
import UiRangesliderClient from "./uiRangesliderClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Range Slider");
};
export default function UiRangeslider() {
  return (
    <>
      <UiRangesliderClient />
    </>
  );
}
