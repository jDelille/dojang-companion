// POST /api/hub: the Hub action route, same body as Companion's
// (app/api/hub/route.ts -> server/hub-gateway.ts), which forwards to Odoo's
// POST /companion/hub/action as the signed-in staff member:
//   { operation, payload, requestKey } -> the result, or { error: { code, status } }
// Reads ("context") send requestKey null; writes need a key matching Odoo's KEY.
//
// Two data sources, chosen on the server (src/server/hub-gateway.ts):
//
//   DOJANG_HUB_ENABLED=true   the real Hub (Odoo). Staff sign in with their Odoo
//                             login; an allowlist: only hub-gateway.ts's
//                             FORWARDED_READS and FORWARDED_ACTIONS (prepare_lead_action,
//                             kind follow_up) go through, every other operation is
//                             refused with HUB_READ_ONLY. If Odoo is down or sign-in fails, the
//                             error is returned as it is. There is no fallback to
//                             the fixtures.
//   otherwise                 DEVELOPMENT-ONLY fixtures (503 in production):
//     context, session_roster,
//     resolve, draft, approve_reply            src/server/inbox-fixture.ts
//     prepare_lead_action                      src/server/crm-fixture.ts
//
// Screens call it the same way either way (src/integrations/hub.ts).

import { isRequestKey } from "@/domain/hubAction";
import { devPrepareLeadAction } from "@/server/crm-fixture";
import { hubEnabled, hubRoute } from "@/server/hub-gateway";
import {
  devInboxContext,
  devInboxOutboundSimulated,
  devInboxWrite,
  devSessionRoster,
  isInboxWrite,
} from "@/server/inbox-fixture";

export const dynamic = "force-dynamic";

const USES_SAMPLE_DATA = process.env.NODE_ENV !== "production";

// Tells this app's own screens that outbound is the development simulation, so
// they can say so. The Hub body itself stays exactly the Hub's.
const SIMULATED_OUTBOUND_HEADER = "x-dojang-dev-simulated-outbound";

const problem = (code: string, status: number) =>
  Response.json({ error: { code, status } }, { status });

function reply(answer: { status: number; body: unknown }) {
  const headers: Record<string, string> = {};
  if (devInboxOutboundSimulated()) headers[SIMULATED_OUTBOUND_HEADER] = "1";
  if (answer.body === null) return new Response(null, { status: answer.status, headers });
  return Response.json(answer.body, { status: answer.status, headers });
}

export async function POST(request: Request) {
  if (hubEnabled()) return hubRoute(request);

  if (!USES_SAMPLE_DATA) return problem("BACKEND_UNAVAILABLE", 503);

  // Only this app's own pages, like Companion's origin check
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return problem("FORBIDDEN", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return problem("INVALID_COMMAND", 400);
  }
  if (
    !body ||
    typeof body !== "object" ||
    Object.keys(body).sort().join() !== "operation,payload,requestKey"
  ) {
    return problem("INVALID_COMMAND", 400);
  }

  const { operation, payload, requestKey } = body as Record<string, unknown>;

  if (operation === "context") return reply(devInboxContext(payload));
  if (operation === "session_roster") return reply(devSessionRoster(payload));

  if (!isRequestKey(requestKey)) return problem("INVALID_COMMAND", 400);
  if (operation === "prepare_lead_action") return reply(devPrepareLeadAction(payload, requestKey));
  if (isInboxWrite(operation)) return reply(devInboxWrite(operation, payload, requestKey));

  return problem("INVALID_COMMAND", 400);
}
