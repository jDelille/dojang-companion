import { getPageMetadata } from "@/config/metadata";
import BodyMeasurementsClient from "./bodyMeasurementsClient";
// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Body Measurements");
};
export default function BodyMeasurements() {
  return (
    <>
      <BodyMeasurementsClient />
    </>
  );
}
