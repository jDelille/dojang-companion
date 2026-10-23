import { getPageMetadata } from "@/config/metadata";
import FormSelect2Client from "./formSelect2Client";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Form Select2");
};
export default function FormSelect2() {
  return (
    <>
      <FormSelect2Client />
    </>
  );
}
