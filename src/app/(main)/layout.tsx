import { DoForMeProvider } from "@/views/doForMe/doForMeProvider";
import StaffShell from "@/views/shell/dojangShell";
import "@/style/css/dojang-shell.css";
import "@/style/css/crm.css";

// Every staff page. Dojang pages get the Dojang shell (nav rail, context pane, top
// bar, Do For Me); template pages keep the template's (see dojangShell.tsx). The
// Do For Me state stays mounted here while staff move between pages.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DoForMeProvider>
      <StaffShell>{children}</StaffShell>
    </DoForMeProvider>
  );
}
