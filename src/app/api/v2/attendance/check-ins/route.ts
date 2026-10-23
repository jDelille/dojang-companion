// Development-only mock: see src/server/kiosk-mock.ts
import { devKioskMock } from "@/server/kiosk-mock";

export function POST(request: Request) {
  return devKioskMock().checkIn(request);
}
