import { useCallback, useMemo, useState } from "react";
import type {
  MembershipPlan,
  PlanCategory,
  PlanSort,
  PlanStatus,
} from "../../types/membershipPlans";
import {
  DEFAULT_PLAN_EMOJI,
  DEFAULT_PLAN_FEATURE,
  MEMBERSHIP_PLANS,
} from "../../utils/json/membershipPlansData";

/*
   Membership Plans state — the React equivalent of the module-level `plans`
   array plus renderPlanTable() in
   tailwind/src/assets/js/membership-plans.js.
*/

export type CategoryFilter = "All" | PlanCategory;
export type PlanStatusFilter = "All" | PlanStatus;

/** Shape the Add/Edit form submits; `id` is null when creating. */
export type PlanFormInput = {
  id: number | null;
  name: string;
  price: number;
  dur: string;
  cat: PlanCategory;
  status: PlanStatus;
  /** Raw comma-separated text from the features field. */
  feat: string;
};

const nextId = (plans: MembershipPlan[]) =>
  Math.max(0, ...plans.map((plan) => plan.id)) + 1;

/** "a, b , c" -> ["a","b","c"], dropping blanks like the template did. */
const parseFeatures = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

export function useMembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>(MEMBERSHIP_PLANS);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("All");
  const [status, setStatus] = useState<PlanStatusFilter>("All");
  const [sort, setSort] = useState<PlanSort>("pop");

  /** The featured strip always shows the first four plans, unfiltered. */
  const featured = useMemo(() => plans.slice(0, 4), [plans]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    const rows = plans.filter((plan) => {
      const matchesQuery = !query || (plan.name + plan.cat).toLowerCase().includes(query);
      const matchesCat = cat === "All" || plan.cat === cat;
      const matchesStatus = status === "All" || plan.status === status;
      return matchesQuery && matchesCat && matchesStatus;
    });

    return [...rows].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      // "Popularity" orders by subscriber count.
      return b.members - a.members;
    });
  }, [plans, search, cat, status, sort]);

  const toggleStatus = useCallback((id: number) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? { ...plan, status: plan.status === "Active" ? "Inactive" : "Active" }
          : plan,
      ),
    );
  }, []);

  /* A duplicate starts inactive with no members, as in duplicatePlan(). */
  const duplicatePlan = useCallback((id: number) => {
    setPlans((prev) => {
      const source = prev.find((plan) => plan.id === id);
      if (!source) return prev;
      const copy: MembershipPlan = {
        ...source,
        id: nextId(prev),
        name: `${source.name} (Copy)`,
        members: 0,
        status: "Inactive",
        feat: [...source.feat],
      };
      return [copy, ...prev];
    });
  }, []);

  const removePlan = useCallback((id: number) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  }, []);

  /** Enrolling a member bumps that plan's subscriber count. */
  const enrol = useCallback((id: number) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, members: plan.members + 1 } : plan)),
    );
  }, []);

  const savePlan = useCallback((input: PlanFormInput) => {
    const features = parseFeatures(input.feat);
    setPlans((prev) => {
      if (input.id != null) {
        return prev.map((plan) =>
          plan.id === input.id
            ? {
                ...plan,
                name: input.name,
                price: input.price,
                dur: input.dur,
                cat: input.cat,
                status: input.status,
                // Clearing the field keeps the existing features.
                feat: features.length ? features : plan.feat,
              }
            : plan,
        );
      }
      const created: MembershipPlan = {
        id: nextId(prev),
        name: input.name,
        emoji: DEFAULT_PLAN_EMOJI,
        cat: input.cat,
        price: input.price,
        dur: input.dur,
        members: 0,
        status: input.status,
        feat: features.length ? features : [DEFAULT_PLAN_FEATURE],
      };
      return [created, ...prev];
    });
  }, []);

  return {
    plans,
    featured,
    visible,
    search,
    setSearch,
    cat,
    setCat,
    status,
    setStatus,
    sort,
    setSort,
    toggleStatus,
    duplicatePlan,
    removePlan,
    enrol,
    savePlan,
  };
}

export default useMembershipPlans;
