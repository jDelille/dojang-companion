import { CalendarCheck, CalendarDays, Gift, Sun, Users } from "lucide-react";
import type { PassTypeName } from "../../types/dayPasses";

/*
   Pass-type icons as components — the React counterpart of the `icon` field
   in TYPES (assets/js/day-passes.js), which named a lucide glyph for the
   template's icons() pass to swap in.
*/
export const PASS_TYPE_ICON: Record<PassTypeName, typeof Sun> = {
  "Day Pass": Sun,
  "Trial Pass": Gift,
  "Guest Pass": Users,
  "Class Drop-in": CalendarCheck,
  "Weekly Pass": CalendarDays,
};

export default PASS_TYPE_ICON;
