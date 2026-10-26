import { notFound } from "next/navigation";
import { getPageMetadata } from "@/config/metadata";
import { focusKey, type CompanionFocus } from "@/domain/companion";
import { getCompanionContext } from "@/integrations/companion";
import { getMemberRecord } from "@/integrations/member";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import Member360 from "@/views/people/member360";
import HubUnavailable from "@/views/shell/hubUnavailable";
import { WorkspaceTabName } from "@/views/shell/workspaceTabs";

export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Member 360");
};

// /people/5001. In Hub mode the id is the Odoo member id, the same one the Inbox
// links to, read with the Hub's member_details.
export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const answer = await getMemberRecord(id);
  if (answer.outcome === "missing") notFound();
  // Not readable with this sign-in, or Odoo is down: say so (no stand-in record),
  // and point Do For Me at this member with nothing but that reason
  if (answer.outcome === "unavailable") {
    const unavailableFocus: CompanionFocus = { kind: "member", memberId: id };
    return (
      <>
        <DoForMeFocus
          focusKey={focusKey(unavailableFocus)}
          context={{
            label: "Member context",
            intelTitle: "Member intelligence",
            intel: [],
            guidance: answer.text,
            suggestions: [],
            receipts: [],
          }}
        />
        <HubUnavailable code={answer.code} text={answer.text} />
      </>
    );
  }

  const { member, attendance } = answer;
  const focus: CompanionFocus = { kind: "member", memberId: member.id };
  const companion = await getCompanionContext(focus);

  return (
    <>
      {companion && <DoForMeFocus focusKey={focusKey(focus)} context={companion} />}
      <WorkspaceTabName label={member.name} />
      <Member360 key={member.id} member={member} attendance={attendance} />
    </>
  );
}
