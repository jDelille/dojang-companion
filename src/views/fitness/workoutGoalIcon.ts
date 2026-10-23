import { Activity, Dumbbell, Flame, Flower2, Zap, type LucideIcon } from "lucide-react";
import type { WorkoutGoal } from "../../types/workouts";

/*
   Goal → icon map, ported from the GOAL constant in
   tailwind/src/assets/js/workouts.js (dumbbell / flame / zap / activity / flower-2).
*/

export const GOAL_ICON: Record<WorkoutGoal, LucideIcon> = {
  "Muscle Gain": Dumbbell,
  "Fat Loss": Flame,
  Strength: Zap,
  Endurance: Activity,
  Mobility: Flower2,
};

export default GOAL_ICON;
