import { useCallback, useMemo, useState } from "react";
import type { DietFormValues, DietPlan } from "../../types/diet";
import { DIET_PLANS } from "../../utils/json/dietData";
import useToast from "../../hooks/useToast";

/*
   Diet Plans state — ported from tailwind/src/assets/js/diet.js. Owns the goal
   tab, type filter and search, the derived KPIs and filtered card list, plus
   every mutation the modals trigger.
*/

/** Macro grams → calorie share (protein/carbs 4 kcal/g, fat 9 kcal/g). */
export const macroPct = (p: DietPlan) => {
  const pc = p.protein * 4;
  const cc = p.carbs * 4;
  const fc = p.fat * 9;
  const tot = pc + cc + fc || 1;
  return {
    p: Math.round((pc / tot) * 100),
    c: Math.round((cc / tot) * 100),
    f: Math.round((fc / tot) * 100),
  };
};

/** Calorie ring fill, measured against a 3000 kcal reference. */
export const ringDegrees = (cal: number) =>
  Math.min(100, Math.round((cal / 3000) * 100)) * 3.6;

export function useDiet() {
  const { message, visible, showToast } = useToast();

  const [plans, setPlans] = useState<DietPlan[]>(DIET_PLANS);
  const [goal, setGoal] = useState("All");
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");

  const find = useCallback((id: number) => plans.find((p) => p.id === id) ?? null, [plans]);

  const kpis = useMemo(
    () => ({
      plans: plans.length,
      assigned: plans.reduce((s, p) => s + p.assigned, 0).toLocaleString("en-US"),
      calories: plans.length
        ? Math.round(
            plans.reduce((s, p) => s + p.calories, 0) / plans.length,
          ).toLocaleString("en-US")
        : "0",
      veg: plans.filter((p) => p.type === "Vegetarian" || p.type === "Vegan").length,
    }),
    [plans],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter((p) => {
      const mq = !q || p.name.toLowerCase().includes(q);
      const mg = goal === "All" || p.goal === goal;
      const mt = type === "All" || p.type === type;
      return mq && mg && mt;
    });
  }, [plans, goal, type, search]);

  /* ---------- Mutations ---------- */

  const savePlan = useCallback(
    (values: DietFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter a plan name");
        return false;
      }

      const data = {
        name,
        goal: values.goal,
        type: values.type,
        calories: Number(values.calories) || 0,
        protein: Number(values.protein) || 0,
        carbs: Number(values.carbs) || 0,
        fat: Number(values.fat) || 0,
      };

      if (editId != null) {
        setPlans((prev) => prev.map((p) => (p.id === editId ? { ...p, ...data } : p)));
        showToast('"' + name + '" updated');
      } else {
        setPlans((prev) => [
          ...prev,
          {
            ...data,
            id: prev.reduce((max, p) => Math.max(max, p.id), 0) + 1,
            assigned: 0,
            meals: [],
          },
        ]);
        showToast('"' + name + '" created');
      }
      return true;
    },
    [showToast],
  );

  const assignPlan = useCallback(
    (id: number, member: string) => {
      const p = find(id);
      if (!p) return;
      setPlans((prev) =>
        prev.map((x) => (x.id === id ? { ...x, assigned: x.assigned + 1 } : x)),
      );
      showToast('"' + p.name + '" assigned to ' + member);
    },
    [find, showToast],
  );

  const schedulePlan = useCallback(
    (id: number, member: string, date: Date | null) => {
      const p = find(id);
      if (!p) return false;
      if (!date) {
        showToast("Pick a start date");
        return false;
      }
      showToast('"' + p.name + '" scheduled for ' + member);
      return true;
    },
    [find, showToast],
  );

  /** Inserts the copy directly after the original, as splice(idx + 1, 0) did. */
  const duplicatePlan = useCallback(
    (id: number) => {
      const p = find(id);
      if (!p) return;
      setPlans((prev) => {
        const index = prev.findIndex((x) => x.id === id);
        if (index < 0) return prev;
        const copy: DietPlan = {
          ...p,
          id: prev.reduce((max, x) => Math.max(max, x.id), 0) + 1,
          name: p.name + " (Copy)",
          assigned: 0,
          meals: p.meals.slice(),
        };
        const next = prev.slice();
        next.splice(index + 1, 0, copy);
        return next;
      });
      showToast('"' + p.name + '" duplicated');
    },
    [find, showToast],
  );

  const deletePlan = useCallback(
    (id: number) => {
      const p = find(id);
      setPlans((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (p?.name ?? "Plan") + '" deleted');
    },
    [find, showToast],
  );

  const exportPlans = useCallback(() => showToast("Diet plans exported"), [showToast]);

  return {
    plans,
    filtered,
    kpis,
    goal,
    setGoal,
    type,
    setType,
    search,
    setSearch,
    find,
    savePlan,
    assignPlan,
    schedulePlan,
    duplicatePlan,
    deletePlan,
    exportPlans,
    toast: { message, visible },
  };
}

export default useDiet;
