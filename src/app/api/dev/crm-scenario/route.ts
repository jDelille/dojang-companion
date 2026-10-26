// Dev-only controls for the CRM fixture's writes (404 in production)
//   GET     see the current scenario and the options
//   PUT     { "scenario": "version-conflict" } to switch. Every scenario but
//           "normal" applies to the next write only:
//             version-conflict  someone else changed the lead -> VERSION_CONFLICT
//             reject            Odoo refuses -> BUSINESS_RULE_REVIEW_REQUIRED, nothing saved
//             lost-response     saved, but the answer is a bare 503 (retry replays it)
//   DELETE  drop every write (tasks, timeline, request keys) back to the sample data
//
// Same shape as /api/dev/kiosk-scenario.

import {
  crmScenarios,
  devCrmScenario,
  isCrmScenario,
  resetDevCrm,
  setDevCrmScenario,
} from "@/server/crm-fixture";

export const dynamic = "force-dynamic";

const ENABLED = process.env.NODE_ENV !== "production";

const notFound = () => new Response(null, { status: 404 });

export function GET() {
  if (!ENABLED) return notFound();
  return Response.json({ scenario: devCrmScenario(), scenarios: crmScenarios });
}

export async function PUT(request: Request) {
  if (!ENABLED) return notFound();

  const body = await request.json().catch(() => null);
  const requested = body?.scenario;
  if (!isCrmScenario(requested)) {
    return Response.json({ error: "Unknown scenario.", scenarios: crmScenarios }, { status: 400 });
  }

  setDevCrmScenario(requested);
  return Response.json({ scenario: devCrmScenario() });
}

export function DELETE() {
  if (!ENABLED) return notFound();
  resetDevCrm();
  return new Response(null, { status: 204 });
}
