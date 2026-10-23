import { getPageMetadata } from "@/config/metadata";
import VerifyEmailClient from "./verifyEmailClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Verify Email");
};
export default function VerifyEmail() {
  return (
    <>
      <VerifyEmailClient />
    </>
  );
}
