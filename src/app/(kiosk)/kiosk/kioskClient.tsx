"use client";

import dynamic from "next/dynamic";
import type { KioskDataMode } from '@/domain/kiosk/dataMode';

const KioskJourney = dynamic(
  () => import("@/views/kiosk/kioskJourney"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function KioskClient({ source }: { source: KioskDataMode }) {
  return <KioskJourney source={source} />;
}
