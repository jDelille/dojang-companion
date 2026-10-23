
"use client";

import dynamic from "next/dynamic";

const BodyMeasurementsComponent = dynamic(
  () => import("@/views/fitness/bodyMeasurements"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function BodyMeasurementsClient() {
  return <BodyMeasurementsComponent />;
}
