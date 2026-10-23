import { getPageMetadata } from "@/config/metadata";
import SettingsClient from "./settingsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Settings");
};
export default function Settings() {
  return (
    <>
      <SettingsClient />
    </>
  );
}
