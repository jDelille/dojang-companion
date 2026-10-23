// PROVISIONAL path (same as Companion). Development-only mock: see src/server/kiosk-mock.ts
import { devKioskMock } from "@/server/kiosk-mock";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;
  return devKioskMock().roster(request, sessionId);
}
