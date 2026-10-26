// Development-only mock: see src/server/kiosk-mock.ts
import { devMockRoute } from "@/server/kiosk-mock";

export function POST(request: Request) {
  return devMockRoute((mock) => mock.checkIn(request));
}
