import { getPageMetadata } from "@/config/metadata";
import ChallengesClient from "./challengesClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Challenges");
};
export default function Challenges() {
  return (
    <>
      <ChallengesClient />
    </>
  );
}
