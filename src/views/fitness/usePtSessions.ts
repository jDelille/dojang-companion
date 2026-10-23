import { useCallback, useMemo, useState } from "react";
import type {
  PtSession,
  PtSessionFormValues,
  SessionStatus,
} from "../../types/ptSessions";
import {
  AMPM,
  FEE_BY_DUR,
  PT_SESSIONS,
  PT_TRAINERS,
  TIMES,
} from "../../utils/json/ptSessionsData";
import { moneyWhole } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   PT Sessions state — ported from tailwind/src/assets/js/pt-sessions.js.
   Owns the active trainer + status filter, the derived KPIs, trainer chips and
   availability grid, plus every mutation the modals trigger.
*/

export const STATUS_BADGE: Record<SessionStatus, string> = {
  scheduled: "badge-active",
  completed: "badge-present",
  cancelled: "badge-absent",
};

export const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const slotLabel = (i: number) => TIMES[i] + " " + AMPM[i];

export const feeOf = (s: PtSession) => FEE_BY_DUR[s.duration] ?? 50;

export function usePtSessions() {
  const { message, visible, showToast } = useToast();

  const [sessions, setSessions] = useState<PtSession[]>(PT_SESSIONS);
  const [activeTrainer, setActiveTrainer] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const find = useCallback(
    (id: number) => sessions.find((s) => s.id === id) ?? null,
    [sessions],
  );

  /** A slot is occupied when a non-cancelled session holds it. */
  const slotTaken = useCallback(
    (trainerId: number, slot: number, exceptId?: number) =>
      sessions.some(
        (s) =>
          s.trainerId === trainerId &&
          s.slot === slot &&
          s.status !== "cancelled" &&
          s.id !== exceptId,
      ),
    [sessions],
  );

  /** Slots a trainer still has free, optionally keeping the session's own slot. */
  const openSlotOptions = useCallback(
    (trainerId: number, exceptId?: number, includeSlot?: number) => {
      const options = TIMES.map((_, i) => i)
        .filter((i) => !slotTaken(trainerId, i, exceptId) || i === includeSlot)
        .map((i) => ({ value: String(i), label: slotLabel(i) }));
      return options.length ? options : [{ value: "", label: "No open slots" }];
    },
    [slotTaken],
  );

  const kpis = useMemo(() => {
    const active = sessions.filter((s) => s.status !== "cancelled");
    const totalSlots = PT_TRAINERS.length * TIMES.length;
    const revenue = active.reduce((sum, s) => sum + feeOf(s), 0);
    return {
      today: active.length,
      open: totalSlots - active.length,
      revenue: moneyWhole(revenue),
      util: Math.round((active.length / totalSlots) * 100) + "%",
    };
  }, [sessions]);

  /** Trainer chips carry a live "N slots open" count. */
  const trainerChips = useMemo(
    () =>
      PT_TRAINERS.map((t) => ({
        trainer: t,
        open: TIMES.filter((_, i) => !slotTaken(t.id, i)).length,
      })),
    [slotTaken],
  );

  const availability = useMemo(
    () =>
      TIMES.map((time, i) => ({
        index: i,
        time,
        ampm: AMPM[i],
        taken: slotTaken(activeTrainer, i),
        selected: selectedSlot === i,
      })),
    [activeTrainer, selectedSlot, slotTaken],
  );

  /** Today's list, filtered by the status tab and sorted AM before PM. */
  const todayList = useMemo(() => {
    const rows = filter === "all" ? sessions.slice() : sessions.filter((s) => s.status === filter);
    rows.sort((a, b) =>
      (AMPM[a.slot] + TIMES[a.slot]).localeCompare(AMPM[b.slot] + TIMES[b.slot]),
    );
    return rows;
  }, [sessions, filter]);

  /* ---------- Mutations ---------- */

  const saveSession = useCallback(
    (values: PtSessionFormValues, editId: number | null) => {
      if (values.slot < 0) {
        showToast("No open slot selected");
        return false;
      }

      const data = {
        trainerId: values.trainerId,
        slot: values.slot,
        member: values.member,
        focus: values.focus,
        duration: values.duration,
      };

      if (editId != null) {
        setSessions((prev) => prev.map((s) => (s.id === editId ? { ...s, ...data } : s)));
        showToast("Session updated");
      } else {
        setSessions((prev) => [
          ...prev,
          {
            ...data,
            id: prev.reduce((max, s) => Math.max(max, s.id), 0) + 1,
            status: "scheduled",
          },
        ]);
        showToast("Session booked for " + data.member);
      }
      setSelectedSlot(null);
      return true;
    },
    [showToast],
  );

  /** Rescheduling also revives a cancelled session. */
  const reschedule = useCallback(
    (id: number, trainerId: number, slot: number) => {
      if (slot < 0) {
        showToast("No open slot selected");
        return false;
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, trainerId, slot, status: "scheduled" as const } : s,
        ),
      );
      showToast("Rescheduled to " + slotLabel(slot));
      return true;
    },
    [showToast],
  );

  const assignTrainer = useCallback(
    (id: number, trainerId: number) => {
      const s = find(id);
      if (!s) return false;

      const trainer = PT_TRAINERS.find((t) => t.id === trainerId);
      if (slotTaken(trainerId, s.slot, s.id)) {
        showToast((trainer?.name ?? "Trainer") + " is busy at " + slotLabel(s.slot));
        return false;
      }
      setSessions((prev) => prev.map((x) => (x.id === id ? { ...x, trainerId } : x)));
      showToast("Assigned to " + (trainer?.name ?? "trainer"));
      return true;
    },
    [find, slotTaken, showToast],
  );

  const assignMember = useCallback(
    (id: number, member: string) => {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, member } : s)));
      showToast("Assigned to " + member);
    },
    [showToast],
  );

  const setStatus = useCallback(
    (id: number, status: SessionStatus, verb: string) => {
      const s = find(id);
      setSessions((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      if (s) showToast(s.member + "'s session " + verb);
    },
    [find, showToast],
  );

  const completeSession = useCallback(
    (id: number) => setStatus(id, "completed", "completed"),
    [setStatus],
  );
  const cancelSession = useCallback(
    (id: number) => setStatus(id, "cancelled", "cancelled"),
    [setStatus],
  );
  const restoreSession = useCallback(
    (id: number) => setStatus(id, "scheduled", "restored"),
    [setStatus],
  );

  const deleteSession = useCallback(
    (id: number) => {
      const s = find(id);
      setSessions((prev) => prev.filter((x) => x.id !== id));
      showToast((s?.member ?? "Session") + "'s session deleted");
    },
    [find, showToast],
  );

  /** Clicking an availability slot books it, unless it is already taken. */
  const pickSlot = useCallback(
    (slot: number) => {
      if (slotTaken(activeTrainer, slot)) {
        showToast("That slot is already booked");
        return false;
      }
      setSelectedSlot(slot);
      return true;
    },
    [activeTrainer, slotTaken, showToast],
  );

  const selectTrainer = useCallback((id: number) => {
    setActiveTrainer(id);
    setSelectedSlot(null);
  }, []);

  const exportSchedule = useCallback(() => showToast("PT schedule exported"), [showToast]);

  return {
    sessions,
    todayList,
    trainerChips,
    availability,
    kpis,
    activeTrainer,
    selectTrainer,
    selectedSlot,
    pickSlot,
    filter,
    setFilter,
    find,
    openSlotOptions,
    saveSession,
    reschedule,
    assignTrainer,
    assignMember,
    completeSession,
    cancelSession,
    restoreSession,
    deleteSession,
    exportSchedule,
    toast: { message, visible },
  };
}

export default usePtSessions;
