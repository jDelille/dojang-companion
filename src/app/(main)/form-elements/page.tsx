import { getPageMetadata } from "@/config/metadata";
import FormElementsClient from "./formElementsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Form Elements");
};
export default function FormElements() {
  return (
    <>
      <FormElementsClient />
    </>
  );
}
