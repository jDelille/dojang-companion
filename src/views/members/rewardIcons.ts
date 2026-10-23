import {
  CalendarCheck,
  Crown,
  CupSoda,
  Dumbbell,
  Gem,
  LogIn,
  Medal,
  RefreshCw,
  Shirt,
  Star,
  Target,
  UserPlus,
} from "lucide-react";
import type { RewardCategory, TierName } from "../../types/rewards";

/*
   Icons for the Rewards page as components — the React counterpart of the
   `icon` fields in CAT_THEME, TIERS and RULE_DEFAULTS
   (assets/js/rewards.js), which named lucide glyphs for the template's
   icons() pass to swap in.
*/

export const CATEGORY_ICON: Record<RewardCategory, typeof Crown> = {
  Membership: Crown,
  Merchandise: Shirt,
  Services: Dumbbell,
  "F&B": CupSoda,
};

export const TIER_ICON: Record<TierName, typeof Medal> = {
  Bronze: Medal,
  Silver: Medal,
  Gold: Crown,
  Platinum: Gem,
};

/** Keyed by EarningRule.key. */
export const RULE_ICON: Record<string, typeof LogIn> = {
  checkin: LogIn,
  referral: UserPlus,
  goal: Target,
  class: CalendarCheck,
  renewal: RefreshCw,
  review: Star,
};
