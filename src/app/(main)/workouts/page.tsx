import { getPageMetadata } from "@/config/metadata";
import WorkoutsClient from "./workoutsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Workouts");
};
export default function Workouts() {
  return (
    <>
      <WorkoutsClient />
    </>
  );
}
