"use client";

import PublicKioskGate from '@/views/kiosk/publicKioskGate';
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
  return source==='odoo-test'?<PublicKioskGate><KioskJourney source={source}/></PublicKioskGate>:<KioskJourney source={source}/>;
}
