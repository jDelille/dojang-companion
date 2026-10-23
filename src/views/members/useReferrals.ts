import { useCallback, useMemo, useRef, useState } from "react";
import type { Referral, ReferralStatus, TopReferrer } from "../../types/referrals";
import { REFERRALS, REFERRAL_REWARD } from "../../utils/json/referralsData";

/*
   Referrals page state — the React equivalent of the `state` object plus
   renderKpis()/renderFunnel()/renderTop()/filtered() in
   tailwind/src/assets/js/referrals.js.
*/

export type ReferralTab = "All" | "Invited" | "Signed Up" | "Converted";

export const REFERRAL_TABS: ReferralTab[] = [
  "All",
  "Invited",
  "Signed Up",
  "Converted",
];

export type ReferralEditInput = {
  id: number;
  friend: string;
  by: string;
  status: ReferralStatus;
  date: string;
};

export function useReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>(REFERRALS);
  const [tab, setTab] = useState<ReferralTab>("All");
  const [search, setSearch] = useState("");

  const idSeq = useRef(REFERRALS.length);

  const kpis = useMemo(() => {
    const converted = referrals.filter((item) => item.status === "Converted").length;
    return {
      total: referrals.length,
      converted,
      rate: Math.round((converted / (referrals.length || 1)) * 100),
      rewards: referrals.reduce((sum, item) => sum + item.reward, 0),
    };
  }, [referrals]);

  const counts = useMemo(() => {
    const base: Record<ReferralTab, number> = {
      All: referrals.length,
      Invited: 0,
      "Signed Up": 0,
      Converted: 0,
    };
    referrals.forEach((item) => {
      // Expired has no tab of its own, so it is not counted here.
      if (item.status in base) base[item.status as ReferralTab] += 1;
    });
    return base;
  }, [referrals]);

  /** Four funnel tiles: invited → signed up → converted → rewards paid. */
  const funnel = useMemo(() => {
    const total = referrals.length || 1;
    const signed = referrals.filter(
      (item) => item.status === "Signed Up" || item.status === "Converted",
    ).length;
    const converted = referrals.filter((item) => item.status === "Converted").length;
    const rewards = referrals.reduce((sum, item) => sum + item.reward, 0);
    return {
      invited: referrals.length,
      signed,
      signedPct: Math.round((signed / total) * 100),
      converted,
      convertedPct: Math.round((converted / total) * 100),
      rewards,
    };
  }, [referrals]);

  /* Ranked by conversions, then by total invited; top five only. */
  const topReferrers = useMemo<TopReferrer[]>(() => {
    const map = new Map<string, TopReferrer>();
    referrals.forEach((item) => {
      const entry = map.get(item.by) ?? { name: item.by, total: 0, conv: 0, earned: 0 };
      entry.total += 1;
      if (item.status === "Converted") {
        entry.conv += 1;
        entry.earned += item.reward;
      }
      map.set(item.by, entry);
    });
    return [...map.values()]
      .sort((a, b) => b.conv - a.conv || b.total - a.total)
      .slice(0, 5);
  }, [referrals]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return referrals.filter((item) => {
      const matchesQuery =
        !query ||
        item.friend.toLowerCase().includes(query) ||
        item.by.toLowerCase().includes(query);
      const matchesTab = tab === "All" || item.status === tab;
      return matchesQuery && matchesTab;
    });
  }, [referrals, search, tab]);

  /*
     Moves a referral one step along the funnel. Converting also releases the
     reward; a referral already converted or expired is left alone and the
     caller is told so it can toast.
  */
  const advance = useCallback(
    (id: number): { moved: boolean; status?: ReferralStatus } => {
      const current = referrals.find((item) => item.id === id);
      if (!current) return { moved: false };
      if (current.status === "Invited") {
        setReferrals((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "Signed Up" } : item,
          ),
        );
        return { moved: true, status: "Signed Up" };
      }
      if (current.status === "Signed Up") {
        setReferrals((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "Converted", reward: REFERRAL_REWARD }
              : item,
          ),
        );
        return { moved: true, status: "Converted" };
      }
      return { moved: false };
    },
    [referrals],
  );

  const approve = useCallback((id: number) => {
    setReferrals((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "Converted", reward: item.reward || REFERRAL_REWARD }
          : item,
      ),
    );
  }, []);

  /** Rejecting expires the referral and clears any reward. */
  const reject = useCallback((id: number) => {
    setReferrals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Expired", reward: 0 } : item,
      ),
    );
  }, []);

  const payReward = useCallback((id: number, amount: number) => {
    setReferrals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Converted", reward: amount } : item,
      ),
    );
  }, []);

  const addReferral = useCallback((friend: string, by: string, phone: string) => {
    setReferrals((prev) => {
      idSeq.current += 1;
      const created: Referral = {
        id: idSeq.current,
        friend: friend.trim(),
        by,
        date: "Just now",
        status: "Invited",
        phone: phone.trim() || "—",
        reward: 0,
      };
      return [created, ...prev];
    });
  }, []);

  /* Converting through the edit form grants the reward if none was set;
     expiring clears it. Other statuses keep whatever was there. */
  const saveReferral = useCallback((input: ReferralEditInput) => {
    setReferrals((prev) =>
      prev.map((item) => {
        if (item.id !== input.id) return item;
        const reward =
          input.status === "Converted"
            ? item.reward || REFERRAL_REWARD
            : input.status === "Expired"
              ? 0
              : item.reward;
        return {
          ...item,
          friend: input.friend.trim() || item.friend,
          by: input.by,
          status: input.status,
          date: input.date.trim() || item.date,
          reward,
        };
      }),
    );
  }, []);

  const removeReferral = useCallback((id: number) => {
    setReferrals((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    referrals,
    visible,
    kpis,
    counts,
    funnel,
    topReferrers,
    tab,
    setTab,
    search,
    setSearch,
    advance,
    approve,
    reject,
    payReward,
    addReferral,
    saveReferral,
    removeReferral,
  };
}

export default useReferrals;
