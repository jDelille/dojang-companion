import { getPageMetadata } from "@/config/metadata";
import { focusKey, type CompanionFocus } from "@/domain/companion";
import { getCompanionContext } from "@/integrations/companion";
import { getCrmContext, USES_SAMPLE_LEADS } from "@/integrations/crm";
import { hubEnabled } from "@/server/hub-gateway";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import SalesPipeline from "@/views/crm/salesPipeline";
import HubUnavailable from "@/views/shell/hubUnavailable";

// CRM data is read per request, never at build time
export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Sales");
};

const FOCUS: CompanionFocus = { kind: "sales" };

// In Hub mode the leads are the real Odoo leads this staff member can see; when
// that read fails, the page says why (or asks them to sign in) instead of
// showing anything else.
export default async function CrmPage() {
  const answer = await getCrmContext();
  const companion = await getCompanionContext(FOCUS);

  return (
    <>
      {companion && <DoForMeFocus focusKey={focusKey(FOCUS)} context={companion} />}
      {answer.outcome === "loaded" ? (
        <SalesPipeline
          context={answer.context}
          showsSampleData={USES_SAMPLE_LEADS}
          fromOdoo={hubEnabled()}
        />
      ) : (
        <div className="crm-scope overflow-hidden rounded-2xl border border-(--crm-line)">
          <HubUnavailable code={answer.code} text={answer.text} />
        </div>
      )}
    </>
  );
}
