import { useCallback, useMemo, useRef, useState } from "react";
import type {
  Challenge,
  ChallengeStatus,
  ChallengeTheme,
  LeaderboardMetric,
  Participant,
} from "../../types/challenges";
import {
  CHALLENGES,
  DEFAULT_REWARD,
  REWARDS_BASELINE,
} from "../../utils/json/challengesData";

/*
   Challenges page state — the React equivalent of the module-level tab /
   activeCh / metric variables plus renderKpis()/renderLeaderboard() in
   tailwind/src/assets/js/challenges.js.
*/

export const CHALLENGE_TABS: ChallengeStatus[] = ["Active", "Upcoming", "Completed"];

export type ChallengeFormInput = {
  id: number | null;
  name: string;
  theme: ChallengeTheme;
  status: ChallengeStatus;
  days: string;
  participants: number;
  reward: string;
};

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>(CHALLENGES);
  const [tab, setTab] = useState<ChallengeStatus>("Active");
  const [metric, setMetric] = useState<LeaderboardMetric>("points");
  /** Which challenge the leaderboard is showing. */
  const [activeId, setActiveId] = useState(0);

  const idSeq = useRef(CHALLENGES.length);

  const kpis = useMemo(() => {
    const active = challenges.filter((item) => item.status === "Active");
    const completion = active.length
      ? Math.round(
          active.reduce((sum, item) => sum + item.completion, 0) / active.length,
        )
      : 0;
    return {
      active: active.length,
      participants: active.reduce((sum, item) => sum + item.participants, 0),
      completion,
      // Podium places awarded across completed challenges, plus a baseline.
      rewards:
        challenges
          .filter((item) => item.status === "Completed")
          .reduce((sum, item) => sum + Math.min(3, item.board.length), 0) +
        REWARDS_BASELINE,
    };
  }, [challenges]);

  /** Cards for the selected tab. */
  const visible = useMemo(
    () => challenges.filter((item) => item.status === tab),
    [challenges, tab],
  );

  /* Falls back to the first active challenge, as renderLeaderboard() did. */
  const selected = useMemo(
    () =>
      challenges.find((item) => item.id === activeId) ??
      challenges.find((item) => item.status === "Active") ??
      null,
    [challenges, activeId],
  );

  /** Board ordered by the chosen metric, highest first. */
  const sortedBoard = useCallback(
    (challenge: Challenge | null): Participant[] =>
      challenge
        ? [...challenge.board].sort((a, b) =>
            metric === "progress" ? b.progress - a.progress : b.points - a.points,
          )
        : [],
    [metric],
  );

  const board = useMemo(() => sortedBoard(selected), [selected, sortedBoard]);

  const saveChallenge = useCallback((input: ChallengeFormInput) => {
    setChallenges((prev) => {
      if (input.id != null) {
        return prev.map((item) =>
          item.id === input.id
            ? {
                ...item,
                name: input.name,
                theme: input.theme,
                status: input.status,
                days: input.days.trim() || "—",
                participants: input.participants,
                reward: input.reward.trim() || DEFAULT_REWARD,
              }
            : item,
        );
      }
      idSeq.current += 1;
      const created: Challenge = {
        id: idSeq.current,
        name: input.name,
        theme: input.theme,
        status: input.status,
        days: input.days.trim() || "—",
        participants: input.participants,
        completion: 0,
        board: [],
        reward: input.reward.trim() || DEFAULT_REWARD,
      };
      return [created, ...prev];
    });
  }, []);

  /** Adding a participant also bumps the headline count. */
  const joinChallenge = useCallback(
    (id: number, name: string, points: number, progress: number) => {
      setChallenges((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                board: [...item.board, { name, points, progress }],
                participants: item.participants + 1,
              }
            : item,
        ),
      );
      setActiveId(id);
    },
    [],
  );

  /* Editing a row re-derives the challenge's average completion. */
  const updateProgress = useCallback(
    (id: number, index: number, points: number, progress: number) => {
      setChallenges((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const board = item.board.map((row, i) =>
            i === index ? { ...row, points, progress } : row,
          );
          const completion = Math.round(
            board.reduce((sum, row) => sum + row.progress, 0) / (board.length || 1),
          );
          return { ...item, board, completion };
        }),
      );
      setActiveId(id);
    },
    [],
  );

  /** Announcing a winner optionally closes the challenge out. */
  const announceWinner = useCallback((id: number, complete: boolean) => {
    if (!complete) return;
    setChallenges((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "Completed", days: "Ended", completion: 100 }
          : item,
      ),
    );
  }, []);

  const removeChallenge = useCallback((id: number) => {
    setChallenges((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    challenges,
    visible,
    selected,
    board,
    sortedBoard,
    kpis,
    tab,
    setTab,
    metric,
    setMetric,
    activeId,
    setActiveId,
    saveChallenge,
    joinChallenge,
    updateProgress,
    announceWinner,
    removeChallenge,
  };
}

export default useChallenges;
