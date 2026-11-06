"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { isDojangPage } from "@/config/dojang";
import PublicLayout from "@/layout/publicLayout";
import { ConnectedDoForMeRail, useDoForMeRailOpen } from "@/views/doForMe/doForMeProvider";
import type { StaffConnection } from "@/domain/staff";
import { ContextPaneSlot } from "./contextPane";
import NavRail, { BottomNav } from "./navRail";
import { StaffConnectionProvider, useStaffConnection } from "./staffConnection";
import StaffSignIn from "./staffSignIn";
import TopBar from "./topBar";
import WorkspaceTabs from "./workspaceTabs";

/*
   The Dojang staff shell, laid out like the mockup (Desktop/vercel-design-1.png):

     [nav rail] [context pane] [top bar / open tabs / page] [Do For Me]

   Responsive like Companion's AdaptiveShell (layout rules in
   style/css/dojang-shell.css):
   - 1440px and up: all four columns
   - below 1440px: Do For Me slides in from the right (round button, or the
     top bar's "Do For Me"); from 1024px the page makes room for it
   - below 1024px: the context pane is a left drawer (list button in the top bar)
   - below 600px: a bottom nav replaces the rail; Do For Me is a bottom tray
   Each column scrolls on its own.

   Only Dojang pages (DOJANG_PATHS) use it. The template pages under (main) keep
   the template shell (sidebar and header).
*/

// Do For Me is a permanent column from this width up
const WIDE = "(min-width: 1440px)";
// Below this the context pane is a drawer
const EXPANDED = "(min-width: 1024px)";

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
  const pathname = usePathname();
  const memberProfile = /^\/people\/[^/]+$/.test(pathname);
  const router = useRouter();
  const signedOut = useStaffConnection()?.state === "signedOut";
  const [companionOpen, setCompanionOpen] = useDoForMeRailOpen();
  // The context drawer is open on the page it was opened on; a new page closes it
  const [contextOpenOn, setContextOpenOn] = useState<string | null>(null);
  const contextOpen = contextOpenOn === pathname;
  const setContextOpen = (open: boolean) => setContextOpenOn(open ? pathname : null);
  // The context pane's column, which <ContextPane> fills
  const [paneSlot, setPaneSlot] = useState<HTMLElement | null>(null);

  // The latest setter, for effects that shouldn't re-run when it changes
  const setCompanionOpenRef = useRef(setCompanionOpen);
  useLayoutEffect(() => {
    setCompanionOpenRef.current = setCompanionOpen;
  });

  // Do For Me starts open only where it's a permanent column, and follows the
  // window across that width: open when it gets wide, closed when it narrows
  const shell = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wide = window.matchMedia(WIDE);
    if (!wide.matches) setCompanionOpenRef.current(false);
    // Until now narrow screens keep Do For Me hidden, so it doesn't flash open
    // on load (dojang-shell.css, [data-ready])
    shell.current?.setAttribute("data-ready", "");
    const onChange = (event: MediaQueryListEvent) => setCompanionOpenRef.current(event.matches);
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, []);

  // Escape closes whichever panel covers the page
  useEffect(() => {
    if (!companionOpen && !contextOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (contextOpen) setContextOpenOn(null);
      else if (!window.matchMedia(WIDE).matches) setCompanionOpenRef.current(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [companionOpen, contextOpen]);

  // The dimmed page behind a drawer was clicked
  function closePanels() {
    setContextOpen(false);
    if (!window.matchMedia(WIDE).matches) setCompanionOpen(false);
  }

  function toggleContext() {
    // On narrow screens only one panel covers the page at a time
    if (!window.matchMedia(EXPANDED).matches) setCompanionOpen(false);
    setContextOpen(!contextOpen);
  }

  function openCompanion() {
    setContextOpen(false);
    setCompanionOpen(true);
  }

  return (
    <div
      ref={shell}
      className={`crm-scope ds-shell${memberProfile ? " member-profile-shell" : ""}`}
      data-context-open={contextOpen}
      data-companion-open={!signedOut && companionOpen}
    >
      <div className="ds-rail-slot">
        <NavRail />
      </div>

      <div
        className="ds-context"
        onClick={(event) => {
          // A link in the drawer goes to another page: close the drawer
          if ((event.target as HTMLElement).closest("a")) setContextOpen(false);
        }}
      >
        <button type="button" className="ds-context-close" aria-label="Close list" onClick={() => setContextOpen(false)}>
          <X size={16} aria-hidden="true" />
        </button>
        <div data-member-context-column ref={setPaneSlot} className="ds-context-slot" />
      </div>

      <div className="ds-workspace">
        <TopBar contextOpen={contextOpen} onToggleContext={toggleContext} />
        {!signedOut && <WorkspaceTabs />}
        <main className="ds-main">
          <ContextPaneSlot.Provider value={paneSlot}>
            {signedOut ? <StaffSignIn onSignedIn={() => router.refresh()} /> : children}
          </ContextPaneSlot.Provider>
        </main>
      </div>

      {/* Below 1024px: the dimmed page behind a drawer; clicking it closes the drawer */}
      <button type="button" className="ds-backdrop" aria-label="Close panel" tabIndex={-1} onClick={closePanels} />

      <div data-member-companion-column className="ds-companion">
        {!signedOut && <ConnectedDoForMeRail />}
      </div>

      {/* Below 1440px: the round button that opens Do For Me */}
      {!signedOut && !companionOpen && (
        <button type="button" className="ds-companion-trigger" aria-label="Open Do For Me" onClick={openCompanion}>
          <Sparkles size={20} aria-hidden="true" />
        </button>
      )}

      <div className="ds-bottom-nav">
        <BottomNav />
      </div>
    </div>
  );
}
