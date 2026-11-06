// Connected attendance uses the paired kiosk scope and native receipt validation.
import {connectedKiosk} from '@/server/kiosk-connected';
import { devMockRoute } from "@/server/kiosk-mock";
import { kioskMode, kioskUnavailable } from '@/server/kiosk-gateway';

export function POST(request: Request) {
  if (kioskMode() === 'odoo-test') return connectedKiosk(request,'checkin');
  if (kioskMode() !== 'fixture') return kioskUnavailable();
  return devMockRoute((mock) => mock.checkIn(request));
}
