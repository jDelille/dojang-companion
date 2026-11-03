import { kioskConfig, kioskUnavailable, pairKiosk } from '@/server/kiosk-gateway';

export async function POST(request: Request) {
  try { return await pairKiosk(request, kioskConfig()); }
  catch { return kioskUnavailable(); }
}
