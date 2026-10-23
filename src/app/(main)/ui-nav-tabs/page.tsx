import { getPageMetadata } from "@/config/metadata";
import UiNavTabsClient from "./uiNavTabsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Nav Tabs");
};
export default function UiNavTabs() {
  return (
    <>
      <UiNavTabsClient />
    </>
  );
}
