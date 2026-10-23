import { getPageMetadata } from "@/config/metadata";
import FeedbackClient from "./feedbackClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Feedback");
};
export default function Feedback() {
  return (
    <>
      <FeedbackClient />
    </>
  );
}
