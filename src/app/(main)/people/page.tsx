import { getPageMetadata } from "@/config/metadata";
import { focusKey, type CompanionFocus } from "@/domain/companion";
import { getCompanionContext } from "@/integrations/companion";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";

// Do For Me context is read per request, never at build time
export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("People");
};

const FOCUS: CompanionFocus = { kind: "people" };

// /people with nobody chosen yet: the People pane beside it lists everyone
export default async function PeoplePage() {
  const companion = await getCompanionContext(FOCUS);

  return (
    <>
      {companion && <DoForMeFocus focusKey={focusKey(FOCUS)} context={companion} />}
      <div className="grid min-h-80 place-items-center p-6">
        <p className="text-sm text-(--crm-text-secondary)">
          Choose a member to see their record.
        </p>
      </div>
    </>
  );
}
