// Companion-compatible path: paired Odoo test sessions or explicit development fixtures.
import { devMockRoute } from "@/server/kiosk-mock";
import { kioskMode, kioskConfig, kioskUnavailable, readKioskSessions } from '@/server/kiosk-gateway';

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const mode = kioskMode();
  if (mode === 'odoo-test') {
    try { return readKioskSessions(request, kioskConfig()); }
    catch { return kioskUnavailable(); }
  }
  if (mode !== 'fixture') return kioskUnavailable();
  return devMockRoute((mock) => mock.sessions(request));
}
