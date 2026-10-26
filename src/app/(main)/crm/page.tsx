import { getPageMetadata } from "@/config/metadata";
import { focusKey, type CompanionFocus } from "@/domain/companion";
import { getCompanionContext } from "@/integrations/companion";
import { getCrmContext, USES_SAMPLE_LEADS } from "@/integrations/crm";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import SalesPipeline from "@/views/crm/salesPipeline";

// CRM data is read per request, never at build time
export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Sales");
};

const FOCUS: CompanionFocus = { kind: "sales" };

export default async function CrmPage() {
  const context = await getCrmContext();
  const companion = await getCompanionContext(FOCUS);

  return (
    <>
      {companion && <DoForMeFocus focusKey={focusKey(FOCUS)} context={companion} />}
      <SalesPipeline context={context} showsSampleData={USES_SAMPLE_LEADS} />
    </>
  );
}
