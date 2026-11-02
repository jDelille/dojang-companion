/*
   The Perspective Engine (Paul's §11): Executive, Facilities, Head Instructor,
   Instructor, Front Desk. One person can be an academy owner, facilities
   manager and instructor at once without separate accounts, and switches
   Perspective rather than signing in again.

   Perspectives are NOT the Staff Portal's users/roles (Owner, Manager, Front
   Desk, Instructor, Facilities, Remote Expert), and NOT the Hub's grant roles
   (owner, manager, instructor). Those are modelled elsewhere; this file never
   reads them.

   A Perspective is a lens on the same portal. It may change navigation, the
   default dashboard, information density, Companion recommendations and quick
   actions. It NEVER changes permissions: nothing here is sent to the Hub, and
   Odoo's grant (dojo.hub.grant) alone decides what a staff member can read or do.

   This file is the one place Perspectives are defined. Screens ask it, never
   compare Perspective names themselves.

   What isn't decided yet, so isn't guessed here:
   - which Perspective a staff member starts in. No source maps Hub roles to
     Perspectives, so nobody gets one automatically.
   - which Perspectives each staff member is offered. All five are listed.
   - navigation, density, Companion recommendations and quick actions for any
     Perspective. Those lenses get added to PerspectiveSetup once they're specified.

   A Perspective that isn't set up yet is listed but can't be chosen, so
   choosing one never looks like it did something it didn't.
*/

export type PerspectiveId = "executive" | "facilities" | "headInstructor" | "instructor" | "frontDesk";

export type PerspectiveSetup = {
  // Where Home (the Dojang mark on the nav rail) goes in this Perspective.
  // null: not specified yet, so the general portal's Home (Today).
  defaultRoute: string | null;
};

export type Perspective = {
  id: PerspectiveId;
  label: string;
  setup: PerspectiveSetup | null; // null: not set up yet (listed, can't be chosen)
};

// Home with no Perspective chosen: the general portal (/ redirects to /today)
export const GENERAL_HOME = "/";

// In the order of Paul's Perspective switch. Only Instructor and Front Desk are
// set up: they're the ones with a workspace to be their default dashboard.
export const PERSPECTIVES: Perspective[] = [
  { id: "executive", label: "Executive", setup: null },
  { id: "facilities", label: "Facilities", setup: null },
  { id: "headInstructor", label: "Head Instructor", setup: null },
  // Its default dashboard is the Instructor workspace (Paul's §12 Instructor mode)
  { id: "instructor", label: "Instructor", setup: { defaultRoute: "/instructor" } },
  // Its default dashboard is the existing Front Desk page (Paul's Front Desk Mode)
  { id: "frontDesk", label: "Front Desk", setup: { defaultRoute: "/front-desk" } },
];

export function findPerspective(id: unknown): Perspective | null {
  return PERSPECTIVES.find((perspective) => perspective.id === id) ?? null;
}

// A Perspective staff can choose: one that's set up
export function isChoosable(id: unknown): id is PerspectiveId {
  return findPerspective(id)?.setup != null;
}

// Where Home goes: the chosen Perspective's default dashboard, else the general portal's
export function homeRoute(id: PerspectiveId | null): string {
  const setup = id ? findPerspective(id)?.setup : null;
  return setup?.defaultRoute ?? GENERAL_HOME;
}
