import {
  Cookie,
  Dumbbell,
  Egg,
  Flame,
  Moon,
  Scale,
  Sun,
  Sunrise,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { DietGoal, MealSlot } from "../../types/diet";

/*
   Goal and meal-slot icon maps, ported from the GOAL_ICON / MEAL_ICON constants
   in tailwind/src/assets/js/diet.js. MEAL_FALLBACK covers the template's
   `MEAL_ICON[meal.slot] || 'utensils'` default.
*/

export const DIET_GOAL_ICON: Record<DietGoal, LucideIcon> = {
  "Weight Loss": Flame,
  "Muscle Gain": Dumbbell,
  Maintenance: Scale,
  Keto: Egg,
};

export const MEAL_ICON: Record<MealSlot, LucideIcon> = {
  Breakfast: Sunrise,
  Lunch: Sun,
  Snack: Cookie,
  Dinner: Moon,
};

export const MEAL_FALLBACK: LucideIcon = Utensils;
