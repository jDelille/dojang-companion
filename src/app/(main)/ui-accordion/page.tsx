import { getPageMetadata } from "@/config/metadata";
import UiAccordionClient from "./uiAccordionClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Accordion");
};
export default function UiAccordion() {
  return (
    <>
      <UiAccordionClient />
    </>
  );
}
