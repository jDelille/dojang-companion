import { getPageMetadata } from "@/config/metadata";
import TrainersClient from "./trainersClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Trainers");
};
export default function Trainers() {
  return (
    <>
      <TrainersClient />
    </>
  );
}
