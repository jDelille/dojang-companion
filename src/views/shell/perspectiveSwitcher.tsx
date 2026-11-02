"use client";

import { PERSPECTIVES, isChoosable } from "@/domain/perspective";
import { choosePerspective, useCurrentPerspective } from "./currentPerspective";
import { useStaffConnection } from "./staffConnection";

/*
   DEVELOPMENT SCAFFOLDING: a manual switcher so Perspective experiences can be
   built and tested before the Hub-driven eligibility and role mapping is
   defined. It isn't the final way staff get a Perspective.

   The Perspective switcher in the command bar, beside the site (Paul's context
   layer: site · Perspective · connectivity). Lists the Perspective Engine's
   five Perspectives (domain/perspective.ts). Only those that are set up can be
   chosen; the others say "not set up yet". Nothing is chosen automatically from
   the Hub's role, because no source maps roles to Perspectives.

   Changing it never changes what staff can see or do: Odoo decides that.
   Shown only when someone is using the portal (signed in, or the development
   sample data); never on the sign-in screen.
*/

const NONE = "";

export default function PerspectiveSwitcher() {
  const connection = useStaffConnection();
  const current = useCurrentPerspective();
  if (connection?.state !== "signedIn" && connection?.state !== "development") return null;

  return (
    <label
      title="A Perspective changes how the portal is laid out, never what you can access"
      // Phones: hidden, to leave room for search (like the site control)
      className="hidden h-10 shrink-0 items-center rounded-xl border border-(--crm-line) bg-(--crm-panel) px-3 text-[12px] font-bold text-(--crm-text) sm:inline-flex"
    >
      <span className="sr-only">Perspective</span>
      <select
        value={current ?? NONE}
        onChange={(event) => {
          const value = event.target.value;
          choosePerspective(isChoosable(value) ? value : null);
        }}
        className="cursor-pointer bg-transparent focus:outline-none"
      >
        <option value={NONE}>No perspective</option>
        {PERSPECTIVES.map((perspective) => (
          <option key={perspective.id} value={perspective.id} disabled={!perspective.setup}>
            {perspective.setup ? perspective.label : `${perspective.label} (not set up yet)`}
          </option>
        ))}
      </select>
    </label>
  );
}
