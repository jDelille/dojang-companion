import { CalendarCheck, Dumbbell, Flame, Footprints } from "lucide-react";
import type { ChallengeTheme } from "../../types/challenges";

/*
   Challenge-theme icons as components — the React counterpart of the `icon`
   field in CH_THEME (assets/js/challenges.js), which named a lucide glyph for
   the template's icons() pass to swap into each card hero.
*/
export const CHALLENGE_THEME_ICON: Record<ChallengeTheme, typeof Footprints> = {
  steps: Footprints,
  weight: Flame,
  strength: Dumbbell,
  streak: CalendarCheck,
};

export default CHALLENGE_THEME_ICON;
