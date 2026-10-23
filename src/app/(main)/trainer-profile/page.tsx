import { getPageMetadata } from "@/config/metadata";
import TrainerProfileClient from "./trainerProfileClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Trainer Profile");
};
export default function TrainerProfile() {
  return (
    <>
      <TrainerProfileClient />
    </>
  );
}
