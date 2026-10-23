import { getPageMetadata } from "@/config/metadata";
import TermsOfServiceClient from "./termsOfServiceClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Terms of Service");
};
export default function TermsOfService() {
  return (
    <>
      <TermsOfServiceClient />
    </>
  );
}
