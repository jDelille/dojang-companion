import { getPageMetadata } from "@/config/metadata";
import UiProgressClient from "./uiProgressClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Progress");
};
export default function UiProgress() {
  return (
    <>
      <UiProgressClient />
    </>
  );
}
