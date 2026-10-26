"use client";

import dynamic from "next/dynamic";

const KioskJourney = dynamic(
  () => import("@/views/kiosk/kioskJourney"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function KioskClient() {
  return <KioskJourney />;
}
