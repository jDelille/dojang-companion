import { Bell, Check, Circle, Phone } from "lucide-react";
import type { RenewalStage } from "../../types/renewals";

/*
   Follow-up stage icons as components — the React counterpart of the `icon`
   field in STAGES (assets/js/renewals.js), which named a lucide glyph for the
   template's icons() pass to swap into the funnel tiles.
*/
export const STAGE_ICON: Record<RenewalStage, typeof Circle> = {
  "Not Contacted": Circle,
  Reminded: Bell,
  Called: Phone,
  Renewed: Check,
};

export default STAGE_ICON;
