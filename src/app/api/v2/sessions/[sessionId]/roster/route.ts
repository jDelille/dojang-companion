// Paired kiosk: native session-scoped roster, never an unrestricted member list.
import {connectedKiosk} from '@/server/kiosk-connected';
import { devMockRoute } from "@/server/kiosk-mock";
import { kioskMode, kioskUnavailable } from '@/server/kiosk-gateway';

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;
  if (kioskMode() === 'odoo-test') return connectedKiosk(request,'roster',sessionId);
  if (kioskMode() !== 'fixture') return kioskUnavailable();
  return devMockRoute((mock) => mock.roster(request, sessionId));
}
