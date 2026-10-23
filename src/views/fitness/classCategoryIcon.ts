import { Activity, Dumbbell, Flower2, Music, Zap, type LucideIcon } from "lucide-react";
import type { ClassCategory } from "../../types/classes";

/*
   Category → icon map, ported from the CAT constant in
   tailwind/src/assets/js/classes.js (flower-2 / zap / dumbbell / activity / music).
*/

export const CATEGORY_ICON: Record<ClassCategory, LucideIcon> = {
  Yoga: Flower2,
  HIIT: Zap,
  Strength: Dumbbell,
  Cardio: Activity,
  Zumba: Music,
};

export default CATEGORY_ICON;
