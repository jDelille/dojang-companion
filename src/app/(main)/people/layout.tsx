import "@/style/css/crm.css";
import { getMembers, USES_SAMPLE_MEMBERS } from "@/integrations/member";
import PeoplePane from "@/views/people/peoplePane";
import { ContextPane } from "@/views/shell/contextPane";
import HubUnavailable from "@/views/shell/hubUnavailable";
import { hubEnabled } from '@/server/hub-gateway';

// Member data is read per request, never at build time
export const dynamic = "force-dynamic";

// People (CRM C02): the People pane goes in the shell's context pane (left of the
// page), and the chosen page (a member's Member 360, or the empty /people page)
// fills the page area. In Hub mode the members are the real Odoo members this
// staff member can see; when that read fails, the page says why (or asks them to
// sign in) instead of showing anything else.
export default async function PeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const answer = await getMembers();

  return (
    <div className="crm-scope">
      {USES_SAMPLE_MEMBERS && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample members · Development preview, not connected to Odoo
        </p>
      )}
      {answer.outcome === "loaded" ? (
        <>
          <ContextPane>
            <PeoplePane members={answer.members} allowIntake={hubEnabled()} />
          </ContextPane>
          {children}
        </>
      ) : (
        <HubUnavailable code={answer.code} text={answer.text} />
      )}
    </div>
  );
}
