import type { Challenge, ChallengeStatus, ChallengeTheme } from "../../types/challenges";

/*
   Seed data and lookup maps for the Challenges page.

   Ported verbatim from tailwind/src/assets/js/challenges.js, where CHALLENGES
   was built by a C() factory with ids starting at 0.
*/

export type ThemeMeta = {
  /** Hero gradient class for the card banner. */
  hero: string;
  /** lucide glyph named by the template. */
  icon: string;
};

export const CHALLENGE_THEME: Record<ChallengeTheme, ThemeMeta> = {
  steps: { hero: "hero-steps", icon: "footprints" },
  weight: { hero: "hero-weight", icon: "flame" },
  strength: { hero: "hero-strength", icon: "dumbbell" },
  streak: { hero: "hero-streak", icon: "calendar-check" },
};

export const THEME_LABEL: Record<ChallengeTheme, string> = {
  steps: "Steps",
  weight: "Weight Loss",
  strength: "Strength",
  streak: "Attendance Streak",
};

export const CHALLENGE_STATUS_BADGE: Record<ChallengeStatus, string> = {
  Active: "badge-present",
  Upcoming: "badge-late",
  Completed: "badge-inactive",
};

export const THEME_OPTIONS: { value: ChallengeTheme; label: string }[] = [
  { value: "steps", label: "Steps" },
  { value: "weight", label: "Weight Loss" },
  { value: "strength", label: "Strength" },
  { value: "streak", label: "Attendance Streak" },
];

export const CHALLENGE_STATUS_OPTIONS: ChallengeStatus[] = [
  "Active",
  "Upcoming",
  "Completed",
];

/** Member picker used by the join modal. */
export const JOIN_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Jessica Ramirez",
  "Omar Haddad",
  "Olivia Chen",
  "Ethan Walsh",
  "Cameron Reid",
];

export const EXPORT_FORMATS = ["CSV", "Excel", "PDF"];

/** Reward given when a new challenge omits one. */
export const DEFAULT_REWARD = "500 loyalty points";

/* The KPI tile adds this baseline to rewards already handed out. */
export const REWARDS_BASELINE = 42;

export const CHALLENGES: Challenge[] = [
  {
    id: 0,
    name: "10K Steps Streak",
    theme: "steps",
    status: "Active",
    days: "Ends in 6 days",
    participants: 84,
    completion: 72,
    reward: "3 months free + merch",
    board: [
      { name: "Ashley Bennett", points: 2840, progress: 92 },
      { name: "Omar Haddad", points: 2610, progress: 86 },
      { name: "Jessica Ramirez", points: 2480, progress: 81 },
      { name: "Marcus Coleman", points: 2210, progress: 74 },
      { name: "Natalie Rivera", points: 1990, progress: 68 },
      { name: "Tyler Brooks", points: 1840, progress: 63 },
      { name: "Megan Sullivan", points: 1620, progress: 57 },
      { name: "Nathan Miller", points: 1450, progress: 51 },
    ],
  },
  {
    id: 1,
    name: "Summer Shred",
    theme: "weight",
    status: "Active",
    days: "Ends in 21 days",
    participants: 56,
    completion: 48,
    reward: "3 months free + merch",
    board: [
      { name: "Ethan Walsh", points: 3120, progress: 78 },
      { name: "Olivia Chen", points: 2890, progress: 71 },
      { name: "Megan Sullivan", points: 2540, progress: 64 },
      { name: "Cameron Reid", points: 2300, progress: 58 },
      { name: "Ashley Bennett", points: 2100, progress: 52 },
      { name: "Marcus Coleman", points: 1880, progress: 47 },
    ],
  },
  {
    id: 2,
    name: "Iron Warrior",
    theme: "strength",
    status: "Active",
    days: "Ends in 12 days",
    participants: 38,
    completion: 61,
    reward: "3 months free + merch",
    board: [
      { name: "Omar Haddad", points: 3450, progress: 88 },
      { name: "Tyler Brooks", points: 3180, progress: 82 },
      { name: "Cameron Reid", points: 2760, progress: 70 },
      { name: "Ethan Walsh", points: 2510, progress: 64 },
      { name: "Nathan Miller", points: 2200, progress: 56 },
    ],
  },
  {
    id: 3,
    name: "Perfect Attendance",
    theme: "streak",
    status: "Active",
    days: "Ends in 9 days",
    participants: 112,
    completion: 84,
    reward: "3 months free + merch",
    board: [
      { name: "Jessica Ramirez", points: 3600, progress: 96 },
      { name: "Ashley Bennett", points: 3540, progress: 94 },
      { name: "Olivia Chen", points: 3400, progress: 90 },
      { name: "Natalie Rivera", points: 3120, progress: 83 },
      { name: "Megan Sullivan", points: 2980, progress: 79 },
    ],
  },
  {
    id: 4,
    name: "New Year New You",
    theme: "weight",
    status: "Upcoming",
    days: "Starts 01 Jan",
    participants: 0,
    completion: 0,
    reward: "3 months free + merch",
    board: [],
  },
  {
    id: 5,
    name: "Marathon Prep 2026",
    theme: "steps",
    status: "Upcoming",
    days: "Starts 15 Aug",
    participants: 0,
    completion: 0,
    reward: "3 months free + merch",
    board: [],
  },
  {
    id: 6,
    name: "Winter Warrior",
    theme: "strength",
    status: "Completed",
    days: "Ended 30 Jun",
    participants: 74,
    completion: 100,
    reward: "3 months free + merch",
    board: [
      { name: "Omar Haddad", points: 4200, progress: 100 },
      { name: "Ethan Walsh", points: 3980, progress: 100 },
      { name: "Cameron Reid", points: 3700, progress: 100 },
      { name: "Tyler Brooks", points: 3400, progress: 96 },
      { name: "Marcus Coleman", points: 3100, progress: 91 },
    ],
  },
];
