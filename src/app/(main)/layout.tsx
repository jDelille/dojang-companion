import { getStaffConnection } from "@/integrations/staff";
import { DoForMeProvider } from "@/views/doForMe/doForMeProvider";
import StaffShell from "@/views/shell/dojangShell";
import "@/style/css/dojang-shell.css";
import "@/style/css/crm.css";

// Who is signed in is read per request, never at build time
export const dynamic = "force-dynamic";

// Every staff page. Dojang pages get the Dojang shell (nav rail, context pane, top
// bar, Do For Me); template pages keep the template's (see dojangShell.tsx). The
// Do For Me state stays mounted here while staff move between pages. Who is
// signed in is read here on each page load and refresh (integrations/staff.ts).
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const connection = await getStaffConnection();
  return (
    <DoForMeProvider>
      <StaffShell connection={connection}>{children}</StaffShell>
    </DoForMeProvider>
  );
}
