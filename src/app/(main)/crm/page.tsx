import { getPageMetadata } from "@/config/metadata";
import { type CompanionFocus } from "@/domain/companion";
import { getCompanionContext } from "@/integrations/companion";
import { getCrmContext, USES_SAMPLE_LEADS } from "@/integrations/crm";
import { hubEnabled } from "@/server/hub-gateway";
import SalesPipeline from "@/views/crm/salesPipeline";
import Link from "next/link";
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
export default async function CrmPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const answer = await getCrmContext(query);
  const companion = await getCompanionContext(FOCUS);

  return (
    <>
      {answer.outcome === "loaded" ? (
        <SalesPipeline
          key={query}
          context={answer.context}
          query={query}
          companion={companion}
          showsSampleData={USES_SAMPLE_LEADS}
          fromOdoo={hubEnabled()}
        />
      ) : (
        <div className="crm-scope overflow-hidden rounded-2xl border border-(--crm-line)">
          {answer.outcome === "unavailable" && <HubUnavailable code={answer.code} text={answer.text} />}
          {query && <Link href="/crm" className="m-5 inline-block text-sm text-(--crm-text) underline">Clear search and return to pipeline</Link>}
        </div>
      )}
    </>
  );
}
