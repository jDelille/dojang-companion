/*
   Shared types for the Challenges & Leaderboard page.

   Mirrors the records built by C() and P() in
   tailwind/src/assets/js/challenges.js.
*/

export type ChallengeTheme = "steps" | "weight" | "strength" | "streak";

export type ChallengeStatus = "Active" | "Upcoming" | "Completed";

/** One row on a challenge's leaderboard. */
export type Participant = {
  name: string;
  points: number;
  /** Percentage complete, 0-100. */
  progress: number;
};

export type Challenge = {
  id: number;
  name: string;
  theme: ChallengeTheme;
  status: ChallengeStatus;
  /** Free-text schedule label, e.g. "Ends in 6 days". */
  days: string;
  participants: number;
  /** Average completion across the board, 0-100. */
  completion: number;
  board: Participant[];
  reward: string;
};

/** Which value the leaderboard ranks by. */
export type LeaderboardMetric = "points" | "progress";
