import { useCallback, useMemo, useRef, useState } from "react";
import type {
  EarningRule,
  LoyaltyMember,
  Redemption,
  Reward,
  RewardCategory,
  TierName,
} from "../../types/rewards";
import {
  LOYALTY_MEMBERS,
  POINTS_ISSUED,
  POINTS_REDEEMED,
  REDEMPTIONS,
  REWARDS,
  RULE_DEFAULTS,
  TIERS,
  UNLIMITED_STOCK,
} from "../../utils/json/rewardsData";

/*
   Rewards page state — the React equivalent of the module-level REWARDS /
   MEMBERS / REDEMPTIONS arrays plus renderKpis()/renderCatalog() in
   tailwind/src/assets/js/rewards.js.
*/

export type CategoryTab = "All" | RewardCategory;

export const CATEGORY_TABS: CategoryTab[] = [
  "All",
  "Membership",
  "Merchandise",
  "Services",
  "F&B",
];

export type RewardFormInput = {
  id: number | null;
  name: string;
  cat: RewardCategory;
  cost: number;
  stock: number;
  desc: string;
};

/** Highest tier whose threshold the balance clears. */
export const tierFor = (points: number): TierName => {
  let tier: TierName = TIERS[0].name;
  TIERS.forEach((item) => {
    if (points >= item.min) tier = item.name;
  });
  return tier;
};

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>(REWARDS);
  const [members, setMembers] = useState<LoyaltyMember[]>(LOYALTY_MEMBERS);
  const [redemptions, setRedemptions] = useState<Redemption[]>(REDEMPTIONS);
  const [rules, setRules] = useState<EarningRule[]>(RULE_DEFAULTS);
  const [issued, setIssued] = useState(POINTS_ISSUED);
  const [redeemed, setRedeemed] = useState(POINTS_REDEEMED);
  const [cat, setCat] = useState<CategoryTab>("All");

  const idSeq = useRef(REWARDS.length);

  const kpis = useMemo(
    () => ({
      issued,
      redeemed,
      outstanding: issued - redeemed,
      // Enrolled members is the sum across tiers, not the seeded member list.
      members: TIERS.reduce((sum, tier) => sum + tier.members, 0),
    }),
    [issued, redeemed],
  );

  const visible = useMemo(
    () => rewards.filter((item) => cat === "All" || item.cat === cat),
    [rewards, cat],
  );

  const findMember = useCallback(
    (name: string) => members.find((item) => item.name === name),
    [members],
  );

  /*
     Redeeming debits the member, credits the redeemed total, decrements
     finite stock and prepends a history row.
  */
  const redeem = useCallback((reward: Reward, memberName: string) => {
    setMembers((prev) =>
      prev.map((item) => {
        if (item.name !== memberName) return item;
        const pts = item.pts - reward.cost;
        return { ...item, pts, tier: tierFor(pts) };
      }),
    );
    setRedeemed((prev) => prev + reward.cost);
    setRewards((prev) =>
      prev.map((item) =>
        item.id === reward.id && item.stock <= UNLIMITED_STOCK
          ? { ...item, stock: Math.max(0, item.stock - 1) }
          : item,
      ),
    );
    setRedemptions((prev) => [
      { member: memberName, reward: reward.name, pts: reward.cost, when: "Just now" },
      ...prev,
    ]);
  }, []);

  const saveReward = useCallback((input: RewardFormInput) => {
    setRewards((prev) => {
      if (input.id != null) {
        return prev.map((item) =>
          item.id === input.id
            ? {
                ...item,
                name: input.name,
                cat: input.cat,
                cost: input.cost,
                stock: input.stock,
                desc: input.desc,
              }
            : item,
        );
      }
      idSeq.current += 1;
      const created: Reward = {
        id: idSeq.current,
        name: input.name,
        desc: input.desc,
        cat: input.cat,
        cost: input.cost,
        stock: input.stock,
      };
      return [created, ...prev];
    });
  }, []);

  const removeReward = useCallback((id: number) => {
    setRewards((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /** Granting points also raises the issued total. */
  const assignPoints = useCallback((memberName: string, points: number) => {
    setMembers((prev) =>
      prev.map((item) => {
        if (item.name !== memberName) return item;
        const pts = item.pts + points;
        return { ...item, pts, tier: tierFor(pts) };
      }),
    );
    setIssued((prev) => prev + points);
  }, []);

  /* A positive delta counts as issued, a negative one as redeemed. */
  const adjustPoints = useCallback((memberName: string, delta: number) => {
    setMembers((prev) =>
      prev.map((item) => {
        if (item.name !== memberName) return item;
        const pts = Math.max(0, item.pts + delta);
        return { ...item, pts, tier: tierFor(pts) };
      }),
    );
    if (delta > 0) setIssued((prev) => prev + delta);
    else setRedeemed((prev) => prev - delta);
  }, []);

  const saveRules = useCallback((next: EarningRule[]) => setRules(next), []);
  const resetRules = useCallback(() => setRules(RULE_DEFAULTS), []);

  return {
    rewards,
    visible,
    members,
    redemptions,
    rules,
    kpis,
    cat,
    setCat,
    findMember,
    redeem,
    saveReward,
    removeReward,
    assignPoints,
    adjustPoints,
    saveRules,
    resetRules,
  };
}

export default useRewards;
