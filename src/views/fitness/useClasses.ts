import { useCallback, useMemo, useState } from "react";
import type { ClassFormValues, GymClass } from "../../types/classes";
import { CLASSES, TIMETABLE_DAYS } from "../../utils/json/classesData";
import useToast from "../../hooks/useToast";

/*
   Class Schedule state — ported from tailwind/src/assets/js/classes.js.
   Owns the category tab + search, the derived KPIs and the per-day
   timetable buckets, plus every mutation the modals trigger.
*/

/** Booked-vs-capacity percentage, capped at 100. */
export const pctOf = (c: GymClass) => Math.min(100, Math.round((c.booked / c.cap) * 100));

/** Fill bar colour thresholds, matching fillClass(). */
export const fillClass = (pct: number) =>
  pct >= 100 ? "fb-full" : pct >= 80 ? "fb-warn" : "fb-ok";

export function useClasses() {
  const { message, visible, showToast } = useToast();

  const [classes, setClasses] = useState<GymClass[]>(CLASSES);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const find = useCallback(
    (id: number) => classes.find((c) => c.id === id) ?? null,
    [classes],
  );

  const kpis = useMemo(() => {
    const live = classes.filter((c) => !c.cancelled);
    const booked = live.reduce((s, c) => s + c.booked, 0);
    const cap = live.reduce((s, c) => s + c.cap, 0) || 1;
    return {
      week: live.length,
      booked: booked.toLocaleString("en-US"),
      fill: Math.round((booked / cap) * 100) + "%",
      full: live.filter((c) => c.booked >= c.cap).length,
    };
  }, [classes]);

  /** One bucket per weekday, already filtered by the tab + search. */
  const timetable = useMemo(() => {
    const q = search.toLowerCase();
    const matches = (c: GymClass) => {
      const mq =
        !q || c.name.toLowerCase().includes(q) || c.trainer.toLowerCase().includes(q);
      const mc = cat === "All" || c.cat === cat;
      return mq && mc;
    };
    return TIMETABLE_DAYS.map((day, index) => ({
      day,
      classes: classes.filter((c) => c.day === index && matches(c)),
    }));
  }, [classes, cat, search]);

  /* ---------- Mutations ---------- */

  const saveClass = useCallback(
    (values: ClassFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter a class name");
        return false;
      }

      const data = {
        name,
        cat: values.cat,
        trainer: values.trainer,
        day: Number(values.day),
        time: values.time.trim() || "06:00 AM",
        dur: values.dur.trim() || "60 min",
        room: values.room.trim() || "Studio A",
        cap: Number(values.cap) || 20,
      };

      if (editId != null) {
        setClasses((prev) => prev.map((c) => (c.id === editId ? { ...c, ...data } : c)));
        showToast("Class updated");
      } else {
        setClasses((prev) => [
          ...prev,
          {
            ...data,
            id: prev.reduce((max, c) => Math.max(max, c.id), 0) + 1,
            booked: 0,
            cancelled: false,
          },
        ]);
        showToast("Class added");
      }
      return true;
    },
    [showToast],
  );

  /** Reschedule also un-cancels the class, matching confirmSchedule(). */
  const rescheduleClass = useCallback(
    (id: number, day: number, time: string, repeat: string) => {
      const target = find(id);
      if (!target) return;
      const slot = time.trim() || target.time;
      setClasses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, day, time: slot, cancelled: false } : c)),
      );
      showToast(
        target.name +
          " scheduled · " +
          TIMETABLE_DAYS[day].dow +
          " " +
          slot +
          " (" +
          repeat +
          ")",
      );
    },
    [find, showToast],
  );

  const assignTrainer = useCallback(
    (id: number, trainer: string) => {
      const target = find(id);
      if (!target) return;
      setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, trainer } : c)));
      showToast(trainer + " assigned to " + target.name);
    },
    [find, showToast],
  );

  /** Books what capacity allows and waitlists the remainder. */
  const bookSeats = useCallback(
    (id: number, seats: number) => {
      const target = find(id);
      if (!target) return;

      const wanted = Math.max(1, Number(seats) || 1);
      const left = target.cap - target.booked;
      if (left <= 0) {
        showToast("Class full — added to waitlist");
        return;
      }
      const take = Math.min(wanted, left);
      setClasses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, booked: c.booked + take } : c)),
      );
      showToast(
        take + " booked into " + target.name + (take < wanted ? " (rest waitlisted)" : ""),
      );
    },
    [find, showToast],
  );

  const cancelClass = useCallback(
    (id: number) => {
      const target = find(id);
      setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, cancelled: true } : c)));
      if (target) showToast(target.name + " cancelled");
    },
    [find, showToast],
  );

  const restoreClass = useCallback(
    (id: number) => {
      const target = find(id);
      setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, cancelled: false } : c)));
      if (target) showToast(target.name + " restored");
    },
    [find, showToast],
  );

  const deleteClass = useCallback(
    (id: number) => {
      const target = find(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      showToast((target?.name ?? "Class") + " deleted");
    },
    [find, showToast],
  );

  const exportSchedule = useCallback(() => showToast("Schedule exported"), [showToast]);

  return {
    classes,
    timetable,
    kpis,
    cat,
    setCat,
    search,
    setSearch,
    find,
    saveClass,
    rescheduleClass,
    assignTrainer,
    bookSeats,
    cancelClass,
    restoreClass,
    deleteClass,
    exportSchedule,
    toast: { message, visible },
  };
}

export default useClasses;
