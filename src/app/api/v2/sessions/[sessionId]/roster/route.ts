// Fixture-only until verified public identification is integrated. Never a real roster dump.
import { devMockRoute } from "@/server/kiosk-mock";
import { kioskMode, kioskUnavailable } from '@/server/kiosk-gateway';

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  if (kioskMode() !== 'fixture') return kioskUnavailable();
  const { sessionId } = await context.params;
  return devMockRoute((mock) => mock.roster(request, sessionId));
}
