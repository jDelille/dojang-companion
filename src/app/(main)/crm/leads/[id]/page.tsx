import { notFound } from "next/navigation";
import { getPageMetadata } from "@/config/metadata";
import { focusKey, type CompanionFocus } from "@/domain/companion";
import { getCompanionContext } from "@/integrations/companion";
import { getLeadDetails, USES_SAMPLE_LEADS } from "@/integrations/crm";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import { hubEnabled } from "@/server/hub-gateway";
import LeadDetail from "@/views/crm/leadDetail";
import { WorkspaceTabName } from "@/views/shell/workspaceTabs";

export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Lead");
};

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const details = await getLeadDetails(id);
  if (!details) notFound();
  const focus: CompanionFocus = { kind: "lead", leadId: details.lead.id };
  const companion = await getCompanionContext(focus);

  return (
    <>
      {companion && <DoForMeFocus focusKey={focusKey(focus)} context={companion} />}
      <WorkspaceTabName label={details.lead.name} />
      <LeadDetail details={details} showsSampleData={USES_SAMPLE_LEADS} peopleFromOdoo={hubEnabled()} />
    </>
  );
}
