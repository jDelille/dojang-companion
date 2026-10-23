import { Circle, Footprints, Globe, Megaphone, Phone, Users } from "lucide-react";
import type { LeadSource } from "../../types/leads";

/*
   Lead-source icons as components — the React counterpart of SRC_ICON in
   assets/js/leads.js, which named a lucide glyph for the template's icons()
   pass to swap in. Circle is the template's own fallback.

   "Instagram" maps to that fallback deliberately: this lucide version ships
   no Instagram glyph (nor does the template's lucide-static set, where the
   name simply resolved to nothing), so Circle keeps the pill's layout intact.
*/
export const SOURCE_ICON: Record<LeadSource, typeof Circle> = {
  "Walk-in": Footprints,
  Website: Globe,
  Instagram: Circle,
  Referral: Users,
  "Google Ads": Megaphone,
  Phone: Phone,
};

export const FALLBACK_SOURCE_ICON = Circle;

export default SOURCE_ICON;
