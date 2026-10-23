/*
   Shared types for the Rewards & Loyalty page.

   Mirrors the records in tailwind/src/assets/js/rewards.js.
*/

export type RewardCategory = "Membership" | "Merchandise" | "Services" | "F&B";

export type TierName = "Bronze" | "Silver" | "Gold" | "Platinum";

export type Reward = {
  id: number;
  name: string;
  desc: string;
  cat: RewardCategory;
  /** Points needed to redeem. */
  cost: number;
  /** Anything above 900 displays as unlimited. */
  stock: number;
};

export type LoyaltyMember = {
  name: string;
  pts: number;
  tier: TierName;
};

export type Redemption = {
  member: string;
  reward: string;
  pts: number;
  /** Relative time label, e.g. "2 hr ago". */
  when: string;
};

/** One row of the editable earning-rules table. */
export type EarningRule = {
  key: string;
  label: string;
  /** lucide glyph named by the template. */
  icon: string;
  pts: number;
};
