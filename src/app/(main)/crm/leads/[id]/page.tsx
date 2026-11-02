import { notFound } from "next/navigation";
import { getPageMetadata } from "@/config/metadata";
import { focusKey, type CompanionFocus } from "@/domain/companion";
import { leadCompanionContext } from "@/domain/leadFollowUp";
import { getLeadDetails, USES_SAMPLE_LEADS } from "@/integrations/crm";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import { hubEnabled } from "@/server/hub-gateway";
import LeadDetail from "@/views/crm/leadDetail";
import HubUnavailable from "@/views/shell/hubUnavailable";
import { WorkspaceTabName } from "@/views/shell/workspaceTabs";

export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Lead");
};

// In Hub mode the lead is the real Odoo lead (lead_details); when that read
// fails, the page says why (or asks the staff member to sign in) instead of
// showing anything else.
export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const answer = await getLeadDetails(id);
  if (answer.outcome === "missing") notFound();
  if (answer.outcome === "unavailable") {
    return (
      <div className="crm-scope overflow-hidden rounded-2xl border border-(--crm-line)">
        <HubUnavailable code={answer.code} text={answer.text} />
      </div>
    );
  }

  const details = answer.details;
  const focus: CompanionFocus = { kind: "lead", leadId: details.lead.id };
  // Do For Me's lead context and its fixed-rule follow-up proposal, built from
  // this same lead_details read (Odoo or sample), never a second read
  const companion = leadCompanionContext(details);

  return (
    <>
      <DoForMeFocus focusKey={focusKey(focus)} context={companion} />
      <WorkspaceTabName label={details.lead.name} />
      <LeadDetail key={details.lead.id} details={details} showsSampleData={USES_SAMPLE_LEADS} hubMode={hubEnabled()} />
    </>
  );
}
