import { getPageMetadata } from "@/config/metadata";
import FormPickersClient from "./formPickersClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Form Pickers");
};
export default function FormPickers() {
  return (
    <>
      <FormPickersClient />
    </>
  );
}
