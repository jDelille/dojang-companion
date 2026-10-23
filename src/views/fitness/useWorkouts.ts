import { useCallback, useMemo, useState } from "react";
import type { WorkoutFormValues, WorkoutPlan } from "../../types/workouts";
import { WORKOUT_PLANS } from "../../utils/json/workoutsData";
import useToast from "../../hooks/useToast";

/*
   Workout Plans state — ported from tailwind/src/assets/js/workouts.js.
   Owns the goal tab, level filter and search, the derived KPIs and filtered
   card list, plus every mutation the modals trigger.
*/

export const daysPerWeek = (p: WorkoutPlan) => p.days.reduce((s, d) => s + d, 0);

export function useWorkouts() {
  const { message, visible, showToast } = useToast();

  const [plans, setPlans] = useState<WorkoutPlan[]>(WORKOUT_PLANS);
  const [goal, setGoal] = useState("All");
  const [level, setLevel] = useState("All");
  const [search, setSearch] = useState("");

  const find = useCallback((id: number) => plans.find((p) => p.id === id) ?? null, [plans]);

  const kpis = useMemo(() => {
    const top = plans.slice().sort((a, b) => b.assigned - a.assigned)[0];
    return {
      plans: plans.length,
      assigned: plans.reduce((s, p) => s + p.assigned, 0).toLocaleString("en-US"),
      exercises: plans.reduce((s, p) => s + p.exercisesCount, 0),
      /** The template shows only the first word of the most-assigned plan. */
      popular: top ? top.name.split(" ")[0] : "—",
    };
  }, [plans]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter((p) => {
      const mq = !q || p.name.toLowerCase().includes(q);
      const mg = goal === "All" || p.goal === goal;
      const ml = level === "All" || p.level === level;
      return mq && mg && ml;
    });
  }, [plans, goal, level, search]);

  /* ---------- Mutations ---------- */

  const savePlan = useCallback(
    (values: WorkoutFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter a plan name");
        return false;
      }
      if (!values.days.some(Boolean)) {
        showToast("Select at least one training day");
        return false;
      }

      const data = {
        name,
        goal: values.goal,
        level: values.level,
        weeks: Number(values.weeks) || 1,
        days: values.days,
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
            exercisesCount: 0,
            sample: [],
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
        const copy: WorkoutPlan = {
          ...p,
          id: prev.reduce((max, x) => Math.max(max, x.id), 0) + 1,
          name: p.name + " (Copy)",
          days: p.days.slice(),
          assigned: 0,
          sample: p.sample.slice(),
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

  const exportPlans = useCallback(() => showToast("Plans exported"), [showToast]);

  return {
    plans,
    filtered,
    kpis,
    goal,
    setGoal,
    level,
    setLevel,
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

export default useWorkouts;
