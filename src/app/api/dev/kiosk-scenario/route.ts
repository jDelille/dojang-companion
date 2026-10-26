// Dev-only controls for the mock kiosk API (404 in production)
//   GET     see the current scenario and the options
//   PUT     { "scenario": "slow" } to switch
//   DELETE  reset check-ins and used keys back to the seed data
//
// Ported from Companion 1cab554b app/api/dev/kiosk-scenario/route.ts.

import { devKioskMock, isKioskScenario, kioskScenarios, resetDevKioskMock } from "@/server/kiosk-mock";

export const dynamic = "force-dynamic";

const notFound = () => new Response(null, { status: 404 });

export function GET() {
  const mock = devKioskMock();
  if (!mock.enabled) return notFound();
  return Response.json({ scenario: mock.scenario(), scenarios: kioskScenarios });
}

export async function PUT(request: Request) {
  const mock = devKioskMock();
  if (!mock.enabled) return notFound();

  const body = await request.json().catch(() => null);
  const requested = body?.scenario;
  if (!isKioskScenario(requested)) {
    return Response.json({ error: "Unknown scenario.", scenarios: kioskScenarios }, { status: 400 });
  }

  mock.setScenario(requested);
  return Response.json({ scenario: mock.scenario() });
}

export function DELETE() {
  if (!devKioskMock().enabled) return notFound();
  resetDevKioskMock();
  return new Response(null, { status: 204 });
}
