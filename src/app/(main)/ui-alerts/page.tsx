import { getPageMetadata } from "@/config/metadata";
import UiAlertsClient from "./uiAlertsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Alerts");
};
export default function UiAlerts() {
  return (
    <>
      <UiAlertsClient />
    </>
  );
}
