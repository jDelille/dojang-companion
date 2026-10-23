import { Activity, Dumbbell, Move, Weight, type LucideIcon } from "lucide-react";
import type { EquipmentCategory } from "../../types/equipment";

/*
   Category → icon map, ported from the CAT_ICON constant in
   tailwind/src/assets/js/equipment.js. EQ_ICON_FALLBACK covers the template's
   `CAT_ICON[e.category] || 'dumbbell'` default.
*/

export const EQ_CAT_ICON: Record<EquipmentCategory, LucideIcon> = {
  Cardio: Activity,
  Strength: Dumbbell,
  "Free Weights": Weight,
  Functional: Move,
};

export const EQ_ICON_FALLBACK: LucideIcon = Dumbbell;
