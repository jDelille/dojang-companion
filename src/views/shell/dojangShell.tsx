"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isDojangPage } from "@/config/dojang";
import PublicLayout from "@/layout/publicLayout";
import { ConnectedDoForMeRail } from "@/views/doForMe/doForMeProvider";
import type { StaffConnection } from "@/domain/staff";
import { ContextPaneSlot } from "./contextPane";
import NavRail from "./navRail";
import { StaffConnectionProvider } from "./staffConnection";
import TopBar from "./topBar";
import WorkspaceTabs from "./workspaceTabs";

/*
   The Dojang staff shell, laid out like the mockup (Desktop/vercel-design-1.png):

     [nav rail] [context pane] [top bar / open tabs / page] [Do For Me]

   Wide screens (lg and up) fill the whole viewport, and each column
   scrolls on its own. Narrower screens keep the nav rail on the left and stack
   the context pane, the page and Do For Me, and the window scrolls.

   Only Dojang pages (DOJANG_PATHS) use it. The template pages under (main) keep
   the template shell (sidebar and header).
*/

export default function StaffShell({
  connection,
  children,
}: {
  connection: StaffConnection; // who is signed in (app/(main)/layout.tsx)
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (!isDojangPage(pathname)) return <PublicLayout>{children}</PublicLayout>;
  return (
    <StaffConnectionProvider connection={connection}>
      <DojangShell>{children}</DojangShell>
    </StaffConnectionProvider>
  );
}

function DojangShell({ children }: { children: ReactNode }) {
  // The context pane's column, which <ContextPane> fills
  const [paneSlot, setPaneSlot] = useState<HTMLElement | null>(null);

  return (
    <div className="crm-scope min-h-dvh lg:h-dvh">
      <div className="grid min-h-dvh grid-cols-[4.5rem_minmax(0,1fr)] lg:h-full lg:min-h-0 lg:grid-cols-[4.5rem_auto_minmax(0,1fr)_auto] lg:overflow-hidden">
        <NavRail />

        <div
          ref={setPaneSlot}
          className="col-start-2 min-w-0 border-b border-(--crm-line) empty:hidden lg:row-start-1 lg:w-60 lg:overflow-y-auto lg:border-r lg:border-b-0"
        />

        <div className="col-start-2 flex min-w-0 flex-col lg:col-start-3 lg:row-start-1 lg:min-h-0">
          <TopBar />
          <WorkspaceTabs />
          <main className="flex-1 p-4 sm:p-6 lg:overflow-y-auto">
            <ContextPaneSlot.Provider value={paneSlot}>{children}</ContextPaneSlot.Provider>
          </main>
        </div>

        <div className="col-start-2 min-w-0 empty:hidden lg:col-start-4 lg:row-start-1 lg:min-h-0">
          <ConnectedDoForMeRail />
        </div>
      </div>
    </div>
  );
}
