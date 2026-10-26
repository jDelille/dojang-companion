import type { CrmContext } from "@/domain/lead";
import type { LeadDetails } from "@/domain/leadDetails";
import { devCrmContext, devLeadDetails } from "@/server/crm-fixture";

// The only place the Sales pipeline gets CRM data from. Runs on the server.
// Outside production it reads the development fixture (src/server/crm-fixture.ts).
// Later: the Hub's crm_context read through the staff member's own session. Only
// the inside of this function changes then; screens keep the same CrmContext shape.

export const USES_SAMPLE_LEADS = process.env.NODE_ENV !== "production";

const NOT_CONNECTED = "CRM data isn't connected to Odoo yet";

export async function getCrmContext(): Promise<CrmContext> {
  if (USES_SAMPLE_LEADS) {
    return devCrmContext();
  }
  throw new Error(NOT_CONNECTED);
}

// One lead's detail record (the Hub's lead_details), or null when there's no such lead
export async function getLeadDetails(leadId: string): Promise<LeadDetails | null> {
  if (USES_SAMPLE_LEADS) {
    return devLeadDetails(leadId);
  }
  throw new Error(NOT_CONNECTED);
}
