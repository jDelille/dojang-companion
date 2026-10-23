import { getPageMetadata } from "@/config/metadata";
import EmailClient from "./emailClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Email");
};
export default function Email() {
  return (
    <>
      <EmailClient />
    </>
  );
}
