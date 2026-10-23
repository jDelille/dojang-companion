import { getPageMetadata } from "@/config/metadata";
import EmailComposeClient from "./emailComposeClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Email Compose");
};
export default function EmailCompose() {
  return (
    <>
      <EmailComposeClient />
    </>
  );
}
