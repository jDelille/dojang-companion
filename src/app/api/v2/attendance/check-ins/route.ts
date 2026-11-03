// Fixture-only: real attendance will use verified identification in a separate slice.
import { devMockRoute } from "@/server/kiosk-mock";
import { kioskMode, kioskUnavailable } from '@/server/kiosk-gateway';

export function POST(request: Request) {
  if (kioskMode() !== 'fixture') return kioskUnavailable();
  return devMockRoute((mock) => mock.checkIn(request));
}
