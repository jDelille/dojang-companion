"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { StaffConnection } from "@/domain/staff";

/*
   The signed-in staff member, for the site control and the nav rail. The server
   reads it on each page load and refresh (integrations/staff.ts, through
   app/(main)/layout.tsx). Between those, the browser can learn first that nobody
   is signed in any more (Sign out, or a page finding the session expired), so
   markSignedOut() shows that at once. The next server read replaces it.
*/

type StaffConnectionState = { connection: StaffConnection; markSignedOut: () => void };

const StaffConnectionContext = createContext<StaffConnectionState | null>(null);

// One object, so "signed out" stays the same value from render to render
// (the command bar compares connections to know when the staff member changed)
const SIGNED_OUT: StaffConnection = { state: "signedOut" };

export function StaffConnectionProvider({
  connection,
  children,
}: {
  connection: StaffConnection;
  children: ReactNode;
}) {
  const [signedOutSince, setSignedOutSince] = useState<StaffConnection | null>(null);

  // Signed out since this server read; a newer read (a new connection object) wins
  const signedOut = signedOutSince === connection;
  const shown: StaffConnection = signedOut ? SIGNED_OUT : connection;

  return (
    <StaffConnectionContext.Provider value={{ connection: shown, markSignedOut: () => setSignedOutSince(connection) }}>
      {children}
    </StaffConnectionContext.Provider>
  );
}

// Outside the Dojang shell (template pages) there's nothing to show
export function useStaffConnection(): StaffConnection | null {
  return useContext(StaffConnectionContext)?.connection ?? null;
}

// Does nothing outside the Dojang shell
export function useMarkSignedOut(): () => void {
  return useContext(StaffConnectionContext)?.markSignedOut ?? noop;
}

function noop() {}
