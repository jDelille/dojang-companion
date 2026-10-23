import type {
  EarningRule,
  LoyaltyMember,
  Redemption,
  Reward,
  RewardCategory,
  TierName,
} from "../../types/rewards";

/*
   Seed data and lookup maps for the Rewards & Loyalty page.

   Ported verbatim from tailwind/src/assets/js/rewards.js, where REWARDS was
   built by an RW() factory with ids starting at 0.
*/

export type Tier = {
  name: TierName;
  /** Points threshold to reach this tier. */
  min: number;
  tint: string;
  cnt: string;
  ic: string;
  /** lucide glyph named by the template. */
  icon: string;
  members: number;
};

export const TIERS: Tier[] = [
  { name: "Bronze", min: 0, tint: "tier-bronze", cnt: "tc-bronze", ic: "tg-bronze", icon: "medal", members: 420 },
  { name: "Silver", min: 2000, tint: "tier-silver", cnt: "tc-silver", ic: "tg-silver", icon: "medal", members: 260 },
  { name: "Gold", min: 5000, tint: "tier-gold", cnt: "tc-gold", ic: "tg-gold", icon: "crown", members: 118 },
  { name: "Platinum", min: 10000, tint: "tier-plat", cnt: "tc-plat", ic: "tg-plat", icon: "gem", members: 34 },
];

export type CategoryTheme = { hero: string; icon: string };

export const CATEGORY_THEME: Record<RewardCategory, CategoryTheme> = {
  Membership: { hero: "rhero-member", icon: "crown" },
  Merchandise: { hero: "rhero-merch", icon: "shirt" },
  Services: { hero: "rhero-service", icon: "dumbbell" },
  "F&B": { hero: "rhero-fb", icon: "cup-soda" },
};

export const CATEGORY_OPTIONS: RewardCategory[] = [
  "Membership",
  "Merchandise",
  "Services",
  "F&B",
];

/** Stock above this reads as "Unlimited"; at or under 30 it warns. */
export const UNLIMITED_STOCK = 900;
export const LOW_STOCK = 30;

/** Opening balances for the points KPIs. */
export const POINTS_ISSUED = 148500;
export const POINTS_REDEEMED = 42600;

export const ASSIGN_REASONS = [
  "Referral bonus",
  "Goal achieved",
  "Check-in streak",
  "Manual grant",
];

export const EXPORT_FORMATS = ["CSV", "Excel", "PDF"];

/** Dataset picker in the export modal — value plus its display label. */
export const EXPORT_SETS = [
  { value: "rewards", label: "Rewards catalog" },
  { value: "redemptions", label: "Redemptions" },
  { value: "members", label: "Member points" },
];

export const RULE_DEFAULTS: EarningRule[] = [
  { key: "checkin", label: "Gym Check-in", icon: "log-in", pts: 10 },
  { key: "referral", label: "Successful Referral", icon: "user-plus", pts: 50 },
  { key: "goal", label: "Fitness Goal Met", icon: "target", pts: 100 },
  { key: "class", label: "Class Attended", icon: "calendar-check", pts: 15 },
  { key: "renewal", label: "Membership Renewal", icon: "refresh-cw", pts: 200 },
  { key: "review", label: "Left a Review", icon: "star", pts: 25 },
];

export const REWARDS: Reward[] = [
  { id: 0, name: "1 Month Free", desc: "Extend membership by 30 days", cat: "Membership", cost: 5000, stock: 999 },
  { id: 1, name: "1 Week Free", desc: "7 bonus days on your plan", cat: "Membership", cost: 1500, stock: 999 },
  { id: 2, name: "FitPro Training Tee", desc: "Premium dry-fit t-shirt", cat: "Merchandise", cost: 1200, stock: 40 },
  { id: 3, name: "Shaker Bottle", desc: "24 oz branded shaker", cat: "Merchandise", cost: 600, stock: 120 },
  { id: 4, name: "Gym Gloves", desc: "Pro lifting gloves", cat: "Merchandise", cost: 900, stock: 25 },
  { id: 5, name: "Free PT Session", desc: "One 1-on-1 training session", cat: "Services", cost: 2000, stock: 999 },
  { id: 6, name: "Body Composition Scan", desc: "InBody assessment", cat: "Services", cost: 1000, stock: 999 },
  { id: 7, name: "Protein Shake", desc: "Post-workout protein shake", cat: "F&B", cost: 400, stock: 200 },
  { id: 8, name: "Cold Brew Coffee", desc: "Free café cold brew", cat: "F&B", cost: 300, stock: 200 },
];

export const LOYALTY_MEMBERS: LoyaltyMember[] = [
  { name: "Ashley Bennett", pts: 6240, tier: "Gold" },
  { name: "Omar Haddad", pts: 11200, tier: "Platinum" },
  { name: "Jessica Ramirez", pts: 3480, tier: "Silver" },
  { name: "Marcus Coleman", pts: 1620, tier: "Bronze" },
  { name: "Tyler Brooks", pts: 5100, tier: "Gold" },
  { name: "Megan Sullivan", pts: 2240, tier: "Silver" },
];

export const REDEMPTIONS: Redemption[] = [
  { member: "Omar Haddad", reward: "Free PT Session", pts: 2000, when: "2 hr ago" },
  { member: "Ashley Bennett", reward: "FitPro Training Tee", pts: 1200, when: "Yesterday" },
  { member: "Jessica Ramirez", reward: "Protein Shake", pts: 400, when: "Yesterday" },
  { member: "Tyler Brooks", reward: "1 Week Free", pts: 1500, when: "2 days ago" },
];
