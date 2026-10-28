import { getPageMetadata } from "@/config/metadata";
import { getCrmContext } from "@/integrations/crm";
import { hubEnabled } from "@/server/hub-gateway";
import FrontDesk from "@/views/frontDesk/frontDesk";
import type { CrmRead } from "@/views/frontDesk/frontDeskRail";

// CRM data is read per request, never at build time
export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Front Desk");
};

// Front Desk: arrivals, the service queue and the active member are read in the
// browser through /api/hub (views/frontDesk/frontDesk.tsx); the Do For Me
// rail's tasks due come from the same crm_context read as Follow-ups, here on
// the server. If that read fails (an instructor has no CRM access, Odoo is
// down) only the rail says so; the rest of the desk still works.
export default async function FrontDeskPage() {
  const source = hubEnabled() ? "hub" : "fixture";
  let crm: CrmRead;
  try {
    const answer = await getCrmContext();
    crm =
      answer.outcome === "loaded"
        ? { outcome: "loaded", context: answer.context }
        : { outcome: "unavailable", text: answer.text };
  } catch {
    crm = { outcome: "unavailable", text: "CRM data isn't connected to Odoo yet." };
  }
  return <FrontDesk crm={crm} source={source} />;
}
