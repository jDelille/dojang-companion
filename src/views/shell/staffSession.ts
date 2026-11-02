"use client";

import { useLayoutEffect, useRef } from "react";
import { useDoForMe } from "@/views/doForMe/doForMeProvider";
import { clearPerspective } from "./currentPerspective";
import { clearWorkspaceTabs } from "./openTabs";
import { useMarkSignedOut } from "./staffConnection";

// What to forget when the signed-in staff member changes (sign-in, sign-out, or
// the Hub saying nobody is signed in any more): the open record tabs and
// everything the Do For Me rail remembers. Both can hold member names, so they
// must not carry over to the next staff member or stay on screen signed out.
// The chosen Perspective goes too: it was that staff member's choice.
export function useStaffSessionReset() {
  const doForMe = useDoForMe();
  return () => {
    clearWorkspaceTabs();
    clearPerspective();
    doForMe.reset();
  };
}

// Authentication is known to be gone (the Hub answered SIGN_IN_REQUIRED or
// UNAUTHENTICATED, e.g. the session expired): forget the same state as a
// sign-out, once, when the sign-in form appears. A layout effect, so the tabs
// and rail are cleared before the browser paints it (never shown signed out for
// a frame). Ordinary errors (Odoo down, no access) never reach here, so they
// keep the tabs. The site control and nav rail say "not signed in" at once too.
export function useResetOnAuthenticationLoss() {
  const resetStaffSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();
  const done = useRef(false);
  useLayoutEffect(() => {
    if (done.current) return;
    done.current = true;
    resetStaffSession();
    markSignedOut();
  }, [resetStaffSession, markSignedOut]);
}
