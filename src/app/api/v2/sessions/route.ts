// PROVISIONAL path (same as Companion). Development-only mock: see src/server/kiosk-mock.ts
import { devMockRoute } from "@/server/kiosk-mock";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return devMockRoute((mock) => mock.sessions(request));
}
