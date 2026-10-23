import { getPageMetadata } from "@/config/metadata";
import FormEditorsClient from "./formEditorsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Form Editors");
};
export default function FormEditors() {
  return (
    <>
      <FormEditorsClient />
    </>
  );
}
