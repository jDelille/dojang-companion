import { getPageMetadata } from "@/config/metadata";
import UiCardsClient from "./uiCardsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Cards");
};
export default function UiCards() {
  return (
    <>
      <UiCardsClient />
    </>
  );
}
