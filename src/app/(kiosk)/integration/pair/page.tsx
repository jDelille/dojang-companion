import { kioskMode } from '@/server/kiosk-gateway';
import KioskPairing from '@/views/kiosk/kioskPairing';

export const dynamic = 'force-dynamic';

export default function IntegrationPairPage() {
  return <KioskPairing enabled={kioskMode() === 'odoo-test'} />;
}
