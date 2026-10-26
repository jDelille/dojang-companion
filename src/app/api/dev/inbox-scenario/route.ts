// Dev-only controls for the inbox fixture (404 in production). Nothing here
// contacts a provider; it only changes the development store.
//   GET     outbound mode and every delivery with the moves it can make next
//   PUT     { "outbound": "simulated" | "not_configured" }
//           { "deliveryId": "7101", "to": "dispatching" }  move a delivery the way
//             the Hub's worker or a signed provider callback would:
//             queued -> dispatching | cancelled
//             dispatching -> accepted | uncertain
//             accepted | uncertain -> delivered | failed
//   DELETE  back to the sample messages (drops deliveries, receipts, request keys)
//
// Same shape as /api/dev/kiosk-scenario.

import {
  advanceDevDelivery,
  devDeliveries,
  devInboxOutboundSimulated,
  resetDevInbox,
  setDevInboxOutboundSimulated,
} from "@/server/inbox-fixture";

export const dynamic = "force-dynamic";

const ENABLED = process.env.NODE_ENV !== "production";

const notFound = () => new Response(null, { status: 404 });

const state = () => ({
  outbound: devInboxOutboundSimulated() ? "simulated" : "not_configured",
  deliveries: devDeliveries(),
});

export function GET() {
  if (!ENABLED) return notFound();
  return Response.json(state());
}

export async function PUT(request: Request) {
  if (!ENABLED) return notFound();
  const body = await request.json().catch(() => null);

  if (body?.outbound === "simulated" || body?.outbound === "not_configured") {
    setDevInboxOutboundSimulated(body.outbound === "simulated");
    return Response.json(state());
  }

  if (typeof body?.deliveryId === "string" && typeof body?.to === "string") {
    if (!advanceDevDelivery(body.deliveryId, body.to)) {
      return Response.json({ error: "That delivery can't move to that state.", ...state() }, { status: 409 });
    }
    return Response.json(state());
  }

  return Response.json(
    { error: 'Send { "outbound": "simulated" | "not_configured" } or { "deliveryId", "to" }.' },
    { status: 400 },
  );
}

export function DELETE() {
  if (!ENABLED) return notFound();
  resetDevInbox();
  return new Response(null, { status: 204 });
}
