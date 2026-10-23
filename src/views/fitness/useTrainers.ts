import { useCallback, useMemo, useState } from "react";
import type {
  AttendanceRow,
  Trainer,
  TrainerFormValues,
  TrainerSort,
  TrainerView,
} from "../../types/trainers";
import { ACCENTS, DAYS, TRAINERS } from "../../utils/json/trainersData";
import { moneyWhole, usd } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Trainer Management state — ported from tailwind/src/assets/js/trainers.js.
   Owns the toolbar state (view / search / level / spec / sort), the derived
   KPI + filtered list, and every mutation the modals trigger.
*/

export const fullName = (t: Trainer) => t.first + " " + t.last;

/** Commission progress against the monthly target, capped at 100%. */
export const pctOf = (t: Trainer) => Math.min(100, Math.round((t.commission / t.target) * 100));

/** Fixed weekly attendance sample — the last day flips with the online flag. */
export const attendanceFor = (t: Trainer): AttendanceRow[] => [
  { d: "Mon, 13 Jul", s: "present" },
  { d: "Tue, 14 Jul", s: "present" },
  { d: "Wed, 15 Jul", s: "late" },
  { d: "Thu, 16 Jul", s: "present" },
  { d: "Fri, 17 Jul", s: t.online ? "present" : "absent" },
];

export function useTrainers() {
  const { message, visible, showToast } = useToast();

  const [trainers, setTrainers] = useState<Trainer[]>(TRAINERS);
  const [view, setView] = useState<TrainerView>("grid");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [spec, setSpec] = useState("All");
  const [sort, setSort] = useState<TrainerSort>("commission");

  const find = useCallback(
    (id: number) => trainers.find((t) => t.id === id) ?? null,
    [trainers],
  );

  const visibleTrainers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = trainers.filter((t) => {
      const mq =
        !q || fullName(t).toLowerCase().includes(q) || t.spec.toLowerCase().includes(q);
      const ml = level === "All" || t.level === level;
      const ms = spec === "All" || t.spec === spec;
      return mq && ml && ms;
    });

    if (sort === "commission") list.sort((a, b) => b.commission - a.commission);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "sessions") list.sort((a, b) => b.sessions - a.sessions);
    else if (sort === "name") list.sort((a, b) => fullName(a).localeCompare(fullName(b)));

    return list;
  }, [trainers, search, level, spec, sort]);

  const kpis = useMemo(() => {
    const totalCommission = trainers.reduce((s, t) => s + t.commission, 0);
    const avgRating = trainers.reduce((s, t) => s + t.rating, 0) / (trainers.length || 1);
    return {
      count: trainers.length,
      sessions: trainers.reduce((s, t) => s + t.sessions, 0),
      commission: usd(totalCommission),
      commissionTotal: moneyWhole(totalCommission),
      rating: avgRating.toFixed(1),
      subtitle:
        trainers.length +
        " active trainers · " +
        usd(totalCommission) +
        " total commissions this month",
    };
  }, [trainers]);

  /** Top 5 by commission — the Commission Board panel. */
  const leaderboard = useMemo(
    () => trainers.slice().sort((a, b) => b.commission - a.commission).slice(0, 5),
    [trainers],
  );

  /* ---------- Mutations ---------- */

  const saveTrainer = useCallback(
    (values: TrainerFormValues, editId: number | null) => {
      const first = values.first.trim();
      const last = values.last.trim();
      if (!first || !last) {
        showToast("Enter the trainer name");
        return false;
      }

      const data = {
        first,
        last,
        phone: values.phone.trim(),
        email: values.email.trim(),
        spec: values.spec,
        level: values.level,
        commission: Number(values.commission) || 0,
        initials: (first[0] + last[0]).toUpperCase(),
      };

      if (editId != null) {
        setTrainers((prev) =>
          prev.map((t) => (t.id === editId ? { ...t, ...data } : t)),
        );
        showToast(first + " " + last + " updated");
      } else {
        setTrainers((prev) => [
          ...prev,
          {
            ...data,
            id: prev.reduce((max, t) => Math.max(max, t.id), 0) + 1,
            accent: ACCENTS[prev.length % ACCENTS.length],
            rating: 4.5,
            sessions: 0,
            members: 0,
            target: 5000,
            trend: 0,
            online: true,
            week: [null, null, null, null, null, null, null],
            classes: [],
          },
        ]);
        showToast(first + " " + last + " added");
      }
      return true;
    },
    [showToast],
  );

  const assignClasses = useCallback(
    (id: number, classes: string[]) => {
      const t = find(id);
      if (!t) return;
      setTrainers((prev) => prev.map((x) => (x.id === id ? { ...x, classes } : x)));
      showToast(
        classes.length +
          " class" +
          (classes.length === 1 ? "" : "es") +
          " assigned to " +
          t.first,
      );
    },
    [find, showToast],
  );

  const scheduleSession = useCallback(
    (id: number, day: number, time: string, repeat: string) => {
      const slot = time.trim();
      if (!slot) {
        showToast("Enter a session time");
        return false;
      }
      setTrainers((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const week = [...t.week] as Trainer["week"];
          week[day] = slot;
          return { ...t, week };
        }),
      );
      showToast("Session added · " + DAYS[day] + " " + slot + " (" + repeat + ")");
      return true;
    },
    [showToast],
  );

  const recordPayment = useCallback(
    (id: number, amount: number, method: string) => {
      const t = find(id);
      if (!t) return;
      showToast(moneyWhole(Number(amount) || 0) + " paid to " + t.first + " via " + method);
    },
    [find, showToast],
  );

  const sendMessage = useCallback(
    (id: number, text: string) => {
      const t = find(id);
      if (!t) return false;
      if (!text.trim()) {
        showToast("Type a message first");
        return false;
      }
      showToast("Message sent to " + t.first);
      return true;
    },
    [find, showToast],
  );

  const removeTrainer = useCallback(
    (id: number) => {
      const t = find(id);
      setTrainers((prev) => prev.filter((x) => x.id !== id));
      showToast((t ? fullName(t) : "Trainer") + " removed");
    },
    [find, showToast],
  );

  const exportReport = useCallback(
    () => showToast("Trainer report exported"),
    [showToast],
  );

  return {
    trainers,
    visibleTrainers,
    leaderboard,
    kpis,
    view,
    setView,
    search,
    setSearch,
    level,
    setLevel,
    spec,
    setSpec,
    sort,
    setSort,
    find,
    saveTrainer,
    assignClasses,
    scheduleSession,
    recordPayment,
    sendMessage,
    removeTrainer,
    exportReport,
    toast: { message, visible },
  };
}

export default useTrainers;
