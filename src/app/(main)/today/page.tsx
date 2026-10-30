import { getPageMetadata } from "@/config/metadata";
import type { TodayCrmRead } from "@/domain/today";
import { getCrmContext } from "@/integrations/crm";
import { hubEnabled } from "@/server/hub-gateway";
import Today from "@/views/today/today";

// CRM data is read per request, never at build time
export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Today");
};

// Today (C01): classes, guardian messages and rosters are read in the browser
// through /api/hub (views/today/today.tsx), like Front Desk; the CRM tasks and
// lead evidence come from the same crm_context read as Follow-ups, here on the
// server. An instructor has no CRM access (FORBIDDEN): the CRM rows are left
// out, not shown as an error. Any other failure only affects the CRM rows.
export default async function TodayPage() {
  const source = hubEnabled() ? "hub" : "fixture";
  let crm: TodayCrmRead;
  try {
    const answer = await getCrmContext();
    if (answer.outcome === "loaded") crm = { outcome: "loaded", context: answer.context };
    else if (answer.code === "FORBIDDEN") crm = { outcome: "forbidden" };
    else crm = { outcome: "unavailable", code: answer.code, text: answer.text };
  } catch {
    crm = { outcome: "unavailable", code: null, text: "CRM data isn't connected to Odoo yet." };
  }
  return <Today crm={crm} source={source} />;
}
