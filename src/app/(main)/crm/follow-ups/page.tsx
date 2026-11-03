import { getPageMetadata } from "@/config/metadata";
import { focusKey, type CompanionFocus } from "@/domain/companion";
import { getCompanionContext } from "@/integrations/companion";
import { getCrmContext, USES_SAMPLE_LEADS } from "@/integrations/crm";
import { hubEnabled } from "@/server/hub-gateway";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import FollowUpQueue from "@/views/crm/followUpQueue";
import HubUnavailable from "@/views/shell/hubUnavailable";

// CRM data is read per request, never at build time
export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Follow-ups");
};

// The rail's Sales focus: the follow-ups are part of Sales
const FOCUS: CompanionFocus = { kind: "sales" };

// The CRM follow-up queue: the open lead and member tasks from the same
// crm_context read as the pipeline. In Hub mode they're the real Odoo tasks
// this staff member can see; when that read fails, the page says why (or asks
// them to sign in) instead of showing anything else.
export default async function FollowUpsPage() {
  const answer = await getCrmContext();
  const companion = await getCompanionContext(FOCUS);

  return (
    <>
      {companion && <DoForMeFocus focusKey={focusKey(FOCUS)} context={companion} />}
      {answer.outcome === "loaded" ? (
        <FollowUpQueue context={answer.context} showsSampleData={USES_SAMPLE_LEADS} fromOdoo={hubEnabled()} />
      ) : (
        <div className="crm-scope">
          <HubUnavailable code={answer.code} text={answer.text} />
        </div>
      )}
    </>
  );
}
