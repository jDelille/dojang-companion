import { getPageMetadata } from "@/config/metadata";
import UiTypographyClient from "./uiTypographyClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Typography");
};
export default function UiTypography() {
  return (
    <>
      <UiTypographyClient />
    </>
  );
}
