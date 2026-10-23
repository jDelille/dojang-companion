import { useCallback, useMemo, useRef, useState } from "react";
import type {
  RenewalBucket,
  RenewalMember,
  RenewalPeriod,
  RenewalStage,
} from "../../types/renewals";
import { RENEWAL_MEMBERS, RENEWAL_STAGES } from "../../utils/json/renewalsData";

/*
   Renewals state — the React equivalent of the `state` object plus
   renderKpis()/renderFunnel()/filtered() in
   tailwind/src/assets/js/renewals.js.
*/

export type RenewalTab = "All" | RenewalBucket;
export type PeriodFilter = "All" | RenewalPeriod;

export const RENEWAL_TABS: RenewalTab[] = [
  "All",
  "Due Soon",
  "Overdue",
  "Lapsed",
  "Renewed",
];

/*
   Which bucket a member falls into. Renewed wins outright; otherwise the sign
   and size of `days` decides, with -14 the cutoff between overdue and lapsed.
*/
export const bucketOf = (member: RenewalMember): RenewalBucket => {
  if (member.stage === "Renewed") return "Renewed";
  if (member.days < 0 && member.days >= -14) return "Overdue";
  if (member.days < -14) return "Lapsed";
  return "Due Soon";
};

export const stageMetaOf = (key: RenewalStage) =>
  RENEWAL_STAGES.find((stage) => stage.key === key)!;

/** Compact USD for the KPI tiles: $82.4K / $1.2M. */
export const shortMoney = (value: number): string => {
  const amount = Number(value) || 0;
  if (amount >= 1e6) return "$" + (amount / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (amount >= 1e3) return "$" + (amount / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return "$" + amount;
};

export type RenewalFormInput = {
  id: number | null;
  name: string;
  plan: string;
  period: RenewalPeriod;
  value: number;
  stage: RenewalStage;
};

export function useRenewals() {
  const [members, setMembers] = useState<RenewalMember[]>(RENEWAL_MEMBERS);
  const [tab, setTab] = useState<RenewalTab>("All");
  const [period, setPeriod] = useState<PeriodFilter>("All");
  const [search, setSearch] = useState("");

  const idSeq = useRef(RENEWAL_MEMBERS.length);

  const kpis = useMemo(() => {
    const pending = members.filter((member) => member.stage !== "Renewed");
    const renewed = members.filter((member) => member.stage === "Renewed").length;
    return {
      soon: pending.filter((member) => member.days >= 0 && member.days <= 30).length,
      lapsed: pending.filter((member) => member.days < 0).length,
      value: pending.reduce((sum, member) => sum + member.value, 0),
      rate: members.length ? Math.round((renewed / members.length) * 100) : 0,
    };
  }, [members]);

  const counts = useMemo(() => {
    const base: Record<RenewalTab, number> = {
      All: members.length,
      "Due Soon": 0,
      Overdue: 0,
      Lapsed: 0,
      Renewed: 0,
    };
    members.forEach((member) => {
      base[bucketOf(member)] += 1;
    });
    return base;
  }, [members]);

  /** One tile per stage: how many members sit there and their pipeline value. */
  const funnel = useMemo(
    () =>
      RENEWAL_STAGES.map((stage) => {
        const items = members.filter((member) => member.stage === stage.key);
        return {
          stage,
          count: items.length,
          value: items.reduce((sum, member) => sum + member.value, 0),
        };
      }),
    [members],
  );

  /* Soonest-to-expire first, so the most urgent rows lead. */
  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return members
      .filter((member) => {
        const matchesQuery = !query || member.name.toLowerCase().includes(query);
        const matchesTab = tab === "All" || bucketOf(member) === tab;
        const matchesPeriod = period === "All" || member.period === period;
        return matchesQuery && matchesTab && matchesPeriod;
      })
      .sort((a, b) => a.days - b.days);
  }, [members, search, tab, period]);

  /** Pipeline value of the rows on screen, excluding those already renewed. */
  const visiblePipeline = useMemo(
    () =>
      visible
        .filter((member) => member.stage !== "Renewed")
        .reduce((sum, member) => sum + member.value, 0),
    [visible],
  );

  const setStage = useCallback((id: number, stage: RenewalStage) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, stage, last: "Just now" } : member,
      ),
    );
  }, []);

  /* Renewing resets the clock to a full year, as confirmRenew() did. */
  const markRenewed = useCallback((id: number) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, stage: "Renewed", days: 365, last: "Just now" }
          : member,
      ),
    );
  }, []);

  const removeMember = useCallback((id: number) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  }, []);

  /*
     Bulk reminder — only touches members never contacted, and reports how
     many were moved so the caller can toast the count.
  */
  const remindAll = useCallback(() => {
    const touched = members.filter((member) => member.stage === "Not Contacted").length;
    setMembers((prev) =>
      prev.map((member) =>
        member.stage === "Not Contacted"
          ? { ...member, stage: "Reminded", last: "Just now" }
          : member,
      ),
    );
    return touched;
  }, [members]);

  const saveMember = useCallback((input: RenewalFormInput) => {
    setMembers((prev) => {
      if (input.id != null) {
        return prev.map((member) =>
          member.id === input.id
            ? {
                ...member,
                name: input.name,
                plan: input.plan,
                period: input.period,
                value: input.value,
                stage: input.stage,
              }
            : member,
        );
      }
      idSeq.current += 1;
      const created: RenewalMember = {
        id: idSeq.current,
        name: input.name,
        plan: input.plan,
        period: input.period,
        days: 30,
        value: input.value,
        last: "Just now",
        stage: input.stage,
      };
      return [created, ...prev];
    });
  }, []);

  /** How many members a campaign audience would reach. */
  const audienceCount = useCallback(
    (audience: string) =>
      members.filter((member) => {
        if (member.stage === "Renewed") return false;
        if (audience === "Due Soon (30 days)") return member.days >= 0 && member.days <= 30;
        if (audience === "Overdue") return member.days < 0 && member.days >= -14;
        if (audience === "Lapsed") return member.days < -14;
        return true;
      }).length,
    [members],
  );

  return {
    members,
    visible,
    visiblePipeline,
    funnel,
    kpis,
    counts,
    tab,
    setTab,
    period,
    setPeriod,
    search,
    setSearch,
    setStage,
    markRenewed,
    removeMember,
    remindAll,
    saveMember,
    audienceCount,
  };
}

export default useRenewals;
