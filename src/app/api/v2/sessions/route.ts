// PROVISIONAL path (same as Companion). Development-only mock: see src/server/kiosk-mock.ts
import { devKioskMock } from "@/server/kiosk-mock";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return devKioskMock().sessions(request);
}
